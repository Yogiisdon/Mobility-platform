"""
ml/models/st_model.py
Spatio-Temporal GNN + LSTM demand forecasting model.

Architecture:
    Input  [B, T, Z, F]
      → GNN (per timestep, batched)  → [B, T, Z, H_gnn]
      → LSTM (per zone, over time)   → [B*Z, H_lstm]
      → Dense head                   → [B, Z]
"""
import torch
import torch.nn as nn
from torch import Tensor
from ml.models.gnn_layers import SimpleGCNLayer, GATLayer


class SpatioTemporalModel(nn.Module):
    def __init__(
        self,
        num_zones:   int,
        in_features: int,
        gnn_hidden:  int = 64,
        lstm_hidden: int = 128,
        lstm_layers: int = 2,
        gnn_type:    str = "gcn",   # 'gcn' | 'gat'
        dropout:     float = 0.1,
    ):
        super().__init__()
        self.num_zones   = num_zones
        self.gnn_hidden  = gnn_hidden
        self.lstm_hidden = lstm_hidden

        LayerCls = GATLayer if gnn_type == "gat" else SimpleGCNLayer
        self.gnn1     = LayerCls(in_features, gnn_hidden)
        self.gnn2     = LayerCls(gnn_hidden,  gnn_hidden)
        self.gnn_norm = nn.LayerNorm(gnn_hidden)

        self.lstm = nn.LSTM(
            input_size  = gnn_hidden,
            hidden_size = lstm_hidden,
            num_layers  = lstm_layers,
            batch_first = True,
            dropout     = dropout if lstm_layers > 1 else 0.0,
        )

        self.head = nn.Sequential(
            nn.Linear(lstm_hidden, lstm_hidden // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(lstm_hidden // 2, 1),
        )

    def forward(self, x: Tensor, edge_index: Tensor, edge_weight: Tensor | None = None) -> Tensor:
        B, T, Z, F = x.shape

        # ── GNN per timestep ──────────────────────────────────────────────────
        gnn_out = []
        for t in range(T):
            xt = x[:, t].reshape(B * Z, F)
            ei, ew = self._batch_graph(edge_index, edge_weight, B, Z, x.device)
            h = self.gnn1(xt, ei, ew)
            h = self.gnn2(h,  ei, ew)
            h = self.gnn_norm(h).reshape(B, Z, self.gnn_hidden)
            gnn_out.append(h)

        # [B, T, Z, H] → [B*Z, T, H]
        seq  = torch.stack(gnn_out, dim=1).permute(0, 2, 1, 3).reshape(B * Z, T, self.gnn_hidden)
        out, _ = self.lstm(seq)
        pred = self.head(out[:, -1]).reshape(B, Z)
        return pred

    @staticmethod
    def _batch_graph(edge_index, edge_weight, B, Z, device):
        offsets = torch.arange(B, device=device) * Z
        ei_list, ew_list = [], []
        for i in range(B):
            ei_list.append(edge_index + offsets[i])
            if edge_weight is not None:
                ew_list.append(edge_weight)
        ei = torch.cat(ei_list, dim=1)
        ew = torch.cat(ew_list) if edge_weight is not None else None
        return ei, ew


class BaselineLSTM(nn.Module):
    """Baseline without graph — for comparison."""

    def __init__(self, num_zones, in_features, lstm_hidden=128, lstm_layers=2, dropout=0.1):
        super().__init__()
        self.lstm = nn.LSTM(in_features, lstm_hidden, lstm_layers, batch_first=True,
                            dropout=dropout if lstm_layers > 1 else 0.0)
        self.head = nn.Linear(lstm_hidden, 1)

    def forward(self, x, edge_index=None, edge_weight=None):
        B, T, Z, F = x.shape
        flat = x.permute(0, 2, 1, 3).reshape(B * Z, T, F)
        out, _ = self.lstm(flat)
        return self.head(out[:, -1]).reshape(B, Z)
