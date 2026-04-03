"""
ml/training/trainer.py
Full end-to-end training pipeline.

Usage:
    python -m ml.training.trainer --city delhi_ncr --epochs 60
"""
import argparse, json, sys, time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT))

from ml.preprocessing.data_generator import generate_rides, assign_grid_zones, build_demand_matrix
from ml.preprocessing.features       import build_feature_tensor, make_dataloaders
from ml.preprocessing.graph_builder  import build_graph
from ml.models.st_model              import SpatioTemporalModel, BaselineLSTM
from ml.evaluation.metrics           import compute_metrics, print_metrics

DEFAULT_CFG = dict(
    city_id     = "delhi_ncr",
    window      = 12,
    horizon     = 1,
    batch_size  = 32,
    epochs      = 60,
    lr          = 1e-3,
    weight_decay= 1e-4,
    gnn_hidden  = 64,
    lstm_hidden = 128,
    lstm_layers = 2,
    gnn_type    = "gcn",
    dropout     = 0.10,
    patience    = 12,
)


def run_epoch(model, loader, ei, ew, criterion, optimizer, device, train=True):
    model.train(train)
    total = 0.0
    ctx   = torch.enable_grad() if train else torch.no_grad()
    with ctx:
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            pred = model(x, ei.to(device), ew.to(device))
            loss = criterion(pred, y)
            if train:
                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), 5.0)
                optimizer.step()
            total += loss.item() * x.size(0)
    return total / len(loader.dataset)


def train(cfg: dict = DEFAULT_CFG):
    data_dir = ROOT / "data"
    ckpt_dir = ROOT / "checkpoints"
    data_dir.mkdir(exist_ok=True)
    ckpt_dir.mkdir(exist_ok=True)

    city = cfg["city_id"]

    # ── Data ──────────────────────────────────────────────────────────────────
    print(f"\n[train] City: {city}")
    print("[train] Generating data…")
    df   = generate_rides(city)
    df   = assign_grid_zones(df)
    wide, _ = build_demand_matrix(df)
    wide.index = wide.index.astype("datetime64[ns]")

    Z    = wide.shape[1]
    lats = np.linspace(28.40, 28.80, Z)  # approximate; real coords from DB
    lons = np.linspace(76.90, 77.50, Z)

    X, demand_norm, scaler = build_feature_tensor(wide, lats, lons, city)
    T, Z, F = X.shape
    print(f"[train] T={T} Z={Z} F={F}")

    import joblib
    joblib.dump(scaler, ckpt_dir / f"{city}_scaler.pkl")

    edge_index, edge_weight = build_graph(lats, lons, demand_norm)
    torch.save({"edge_index": edge_index, "edge_weight": edge_weight},
               ckpt_dir / f"{city}_graph.pt")

    train_dl, val_dl, test_dl = make_dataloaders(
        X, demand_norm,
        window=cfg["window"], horizon=cfg["horizon"],
        batch_size=cfg["batch_size"],
    )

    # ── Model ─────────────────────────────────────────────────────────────────
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[train] Device: {device}")

    model = SpatioTemporalModel(
        num_zones=Z, in_features=F,
        gnn_hidden=cfg["gnn_hidden"], lstm_hidden=cfg["lstm_hidden"],
        lstm_layers=cfg["lstm_layers"], gnn_type=cfg["gnn_type"],
        dropout=cfg["dropout"],
    ).to(device)

    n_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"[train] Parameters: {n_params:,}")

    criterion = nn.MSELoss()
    optimizer = AdamW(model.parameters(), lr=cfg["lr"], weight_decay=cfg["weight_decay"])
    scheduler = CosineAnnealingLR(optimizer, T_max=cfg["epochs"], eta_min=cfg["lr"] * 0.05)

    # ── Loop ──────────────────────────────────────────────────────────────────
    best_val  = float("inf")
    patience  = 0
    history   = {"train": [], "val": []}

    print(f"\n{'Epoch':>5}  {'Train':>10}  {'Val':>10}  {'Time':>6}")
    print("─" * 38)

    for epoch in range(1, cfg["epochs"] + 1):
        t0  = time.time()
        tr  = run_epoch(model, train_dl, edge_index, edge_weight, criterion, optimizer, device, True)
        val = run_epoch(model, val_dl,   edge_index, edge_weight, criterion, optimizer, device, False)
        scheduler.step()
        elapsed = time.time() - t0

        history["train"].append(tr)
        history["val"].append(val)
        print(f"{epoch:>5}  {tr:>10.5f}  {val:>10.5f}  {elapsed:>5.1f}s")

        if val < best_val:
            best_val = val
            patience = 0
            torch.save({
                "epoch": epoch, "val_loss": val,
                "model_state": model.state_dict(),
                "optimizer_state": optimizer.state_dict(),
                "config": cfg | {"in_features": F, "num_zones": Z},
            }, ckpt_dir / f"{city}_best_model.pt")
        else:
            patience += 1
            if patience >= cfg["patience"]:
                print(f"\n[train] Early stop at epoch {epoch}.")
                break

    # ── Evaluation ────────────────────────────────────────────────────────────
    print("\n[train] Loading best checkpoint for test evaluation…")
    ckpt = torch.load(ckpt_dir / f"{city}_best_model.pt", weights_only=False)
    model.load_state_dict(ckpt["model_state"])

    gnn_metrics = compute_metrics(model, test_dl, edge_index, edge_weight, scaler, device)
    print_metrics(gnn_metrics, "GNN+LSTM")

    baseline = BaselineLSTM(Z, F, cfg["lstm_hidden"], cfg["lstm_layers"]).to(device)
    bl_opt   = AdamW(baseline.parameters(), lr=cfg["lr"])
    for _ in range(10):
        run_epoch(baseline, train_dl, edge_index, edge_weight, criterion, bl_opt, device, True)
    bl_metrics = compute_metrics(baseline, test_dl, edge_index, edge_weight, scaler, device)
    print_metrics(bl_metrics, "Baseline LSTM")

    results = {"gnn_lstm": gnn_metrics, "baseline": bl_metrics, "config": cfg, "history": history}
    (ckpt_dir / f"{city}_results.json").write_text(json.dumps(results, indent=2))
    print(f"\n[train] Results → {ckpt_dir / f'{city}_results.json'}")
    return results


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--city",    default="delhi_ncr")
    p.add_argument("--epochs",  type=int, default=60)
    p.add_argument("--batch",   type=int, default=32)
    p.add_argument("--lr",      type=float, default=1e-3)
    p.add_argument("--gnn",     default="gcn", choices=["gcn", "gat"])
    args = p.parse_args()

    cfg = DEFAULT_CFG | {
        "city_id": args.city, "epochs": args.epochs,
        "batch_size": args.batch, "lr": args.lr, "gnn_type": args.gnn,
    }
    train(cfg)
