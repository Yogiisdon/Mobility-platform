"""
ml/preprocessing/graph_builder.py
Build the city zone graph (adjacency matrix + edge tensors).

Three strategies:
  distance    — connect zones within X km
  correlation — connect zones with similar demand patterns
  combined    — union of both (recommended)
"""
import numpy as np
import torch
from scipy.spatial.distance import cdist


def build_distance_edges(
    lats: np.ndarray,
    lons: np.ndarray,
    threshold_km: float = 4.0,
    self_loops: bool = True,
):
    avg_lat = np.radians(lats.mean())
    scale   = np.array([111.0, 111.0 * np.cos(avg_lat)])
    coords  = np.stack([lats, lons], axis=1) * scale
    dist    = cdist(coords, coords, metric="euclidean")

    rows, cols = np.where((dist < threshold_km) & (dist > 0))
    weights = 1.0 / (dist[rows, cols] + 1e-6)
    weights /= weights.max()

    if self_loops:
        n = len(lats)
        idx = np.arange(n)
        rows    = np.concatenate([rows, idx])
        cols    = np.concatenate([cols, idx])
        weights = np.concatenate([weights, np.ones(n)])

    return np.stack([rows, cols]).astype(np.int64), weights.astype(np.float32)


def build_correlation_edges(
    demand_matrix: np.ndarray,   # [T, Z]
    threshold: float = 0.65,
    self_loops: bool = True,
):
    Z    = demand_matrix.shape[1]
    corr = np.corrcoef(demand_matrix.T)
    rows, cols = np.where((corr >= threshold) & (np.eye(Z) == 0))
    weights    = corr[rows, cols].astype(np.float32)

    if self_loops:
        idx     = np.arange(Z)
        rows    = np.concatenate([rows, idx])
        cols    = np.concatenate([cols, idx])
        weights = np.concatenate([weights, np.ones(Z, dtype=np.float32)])

    return np.stack([rows, cols]).astype(np.int64), weights


def build_combined_edges(lats, lons, demand_matrix, dist_km=4.0, corr_thr=0.6):
    ei_d, ew_d = build_distance_edges(lats, lons, dist_km)
    ei_c, ew_c = build_correlation_edges(demand_matrix, corr_thr)

    edge_dict: dict[tuple, list] = {}
    for (s, d), w in zip(ei_d.T, ew_d):
        edge_dict[(s, d)] = [w]
    for (s, d), w in zip(ei_c.T, ew_c):
        if (s, d) in edge_dict:
            edge_dict[(s, d)].append(w)
        else:
            edge_dict[(s, d)] = [w]

    edges   = list(edge_dict.keys())
    weights = [float(np.mean(v)) for v in edge_dict.values()]
    return np.array(edges, dtype=np.int64).T, np.array(weights, dtype=np.float32)


def build_graph(lats, lons, demand_matrix=None, strategy="combined"):
    print(f"[graph] Building graph — strategy={strategy}, zones={len(lats)}")
    if strategy == "distance":
        ei, ew = build_distance_edges(lats, lons)
    elif strategy == "correlation" and demand_matrix is not None:
        ei, ew = build_correlation_edges(demand_matrix)
    elif demand_matrix is not None:
        ei, ew = build_combined_edges(lats, lons, demand_matrix)
    else:
        ei, ew = build_distance_edges(lats, lons)

    print(f"[graph] Edges: {ei.shape[1]}, avg degree: {ei.shape[1]/len(lats):.1f}")
    return (
        torch.tensor(ei, dtype=torch.long),
        torch.tensor(ew, dtype=torch.float32),
    )
