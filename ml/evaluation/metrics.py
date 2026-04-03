"""
ml/evaluation/metrics.py
MAE, RMSE, MAPE + full model evaluation on a DataLoader.
"""
import numpy as np
import torch


def mae(y_true, y_pred):
    return float(np.mean(np.abs(y_true - y_pred)))

def rmse(y_true, y_pred):
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))

def mape(y_true, y_pred, eps=1.0):
    mask = np.abs(y_true) > eps
    if not mask.any():
        return float("nan")
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def compute_metrics(model, dataloader, edge_index, edge_weight, scaler, device):
    model.eval()
    yt, yp = [], []
    with torch.no_grad():
        for x, y in dataloader:
            pred = model(x.to(device), edge_index.to(device), edge_weight.to(device))
            yt.append(y.numpy())
            yp.append(pred.cpu().numpy())

    yt = np.vstack(yt)
    yp = np.vstack(yp)
    yt_inv = scaler.inverse_transform(yt)
    yp_inv = scaler.inverse_transform(yp)

    return {
        "mae":  round(mae(yt_inv, yp_inv),  3),
        "rmse": round(rmse(yt_inv, yp_inv), 3),
        "mape": round(mape(yt_inv, yp_inv), 2),
    }


def print_metrics(m: dict, label: str = ""):
    tag = f"[{label}] " if label else ""
    print(f"{tag}MAE={m['mae']:.3f}  RMSE={m['rmse']:.3f}  MAPE={m['mape']:.2f}%")
