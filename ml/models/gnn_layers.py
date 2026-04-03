"""
ml/models/gnn_layers.py
Graph Neural Network layers for spatial feature aggregation.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


class SimpleGCNLayer(nn.Module):
    """Spectral GCN layer — Kipf & Welling 2017."""

    def __init__(self, in_features: int, out_features: int, bias: bool = True):
        super().__init__()
        self.linear = nn.Linear(in_features, out_features, bias=bias)

    def forward(self, x: Tensor, edge_index: Tensor, edge_weight: Tensor | None = None) -> Tensor:
        N = x.size(0)
        src, dst = edge_index[0], edge_index[1]
        h = self.linear(x)

        if edge_weight is None:
            edge_weight = torch.ones(edge_index.size(1), device=x.device)

        deg = torch.zeros(N, device=x.device).scatter_add(0, dst, edge_weight)
        deg_inv_sqrt = deg.pow(-0.5).clamp(max=1e4)
        norm = deg_inv_sqrt[src] * edge_weight * deg_inv_sqrt[dst]

        agg = torch.zeros_like(h).scatter_add(
            0,
            dst.unsqueeze(-1).expand(-1, h.size(-1)),
            h[src] * norm.unsqueeze(-1),
        )
        return F.relu(agg)


class GATLayer(nn.Module):
    """Single-head Graph Attention Network — Veličković et al. 2018."""

    def __init__(self, in_features: int, out_features: int, dropout: float = 0.1):
        super().__init__()
        self.W       = nn.Linear(in_features, out_features, bias=False)
        self.a       = nn.Linear(2 * out_features, 1, bias=False)
        self.dropout = nn.Dropout(dropout)
        self.leaky   = nn.LeakyReLU(0.2)

    def forward(self, x: Tensor, edge_index: Tensor, edge_weight: Tensor | None = None) -> Tensor:
        N = x.size(0)
        src, dst = edge_index[0], edge_index[1]
        h = self.W(x)

        alpha = self.leaky(self.a(torch.cat([h[src], h[dst]], dim=-1))).squeeze(-1)
        if edge_weight is not None:
            alpha = alpha * edge_weight

        alpha -= alpha.max()
        alpha_exp = alpha.exp()
        alpha_sum = torch.zeros(N, device=x.device).scatter_add(0, dst, alpha_exp)
        alpha_norm = self.dropout(alpha_exp / (alpha_sum[dst] + 1e-8))

        out = torch.zeros_like(h).scatter_add(
            0,
            dst.unsqueeze(-1).expand(-1, h.size(-1)),
            h[src] * alpha_norm.unsqueeze(-1),
        )
        return F.elu(out)
