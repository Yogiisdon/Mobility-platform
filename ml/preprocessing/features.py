"""
ml/preprocessing/features.py
Build the [T, Z, F] feature tensor and PyTorch Dataset.
"""
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import StandardScaler

# City centre coordinates (used for distance-to-centre feature)
CITY_CENTERS = {
    "delhi_ncr":  (28.6315, 77.2167),  # Connaught Place
    "mumbai":     (19.0760, 72.8777),
    "bengaluru":  (12.9716, 77.5946),
    "chennai":    (13.0827, 80.2707),
    "hyderabad":  (17.3850, 78.4867),
    "kolkata":    (22.5726, 88.3639),
}

DEMAND_PROFILES = {
    "CBD":         [.18,.12,.09,.08,.12,.25,.55,.88,.98,.84,.72,.76,.80,.74,.70,.72,.84,.95,.90,.76,.64,.52,.40,.26],
    "Commercial":  [.16,.10,.08,.07,.10,.20,.40,.68,.76,.70,.74,.84,.92,.88,.80,.78,.84,.88,.82,.74,.66,.56,.44,.26],
    "Mixed":       [.17,.11,.08,.07,.11,.22,.45,.75,.85,.74,.70,.76,.84,.78,.72,.74,.82,.90,.84,.72,.62,.50,.38,.24],
    "Residential": [.22,.16,.12,.10,.15,.28,.52,.74,.72,.58,.52,.55,.60,.55,.50,.54,.68,.78,.82,.78,.72,.65,.55,.36],
    "Transit":     [.60,.55,.50,.52,.58,.65,.72,.82,.85,.82,.78,.80,.82,.80,.78,.80,.84,.88,.90,.86,.80,.74,.70,.65],
    "Industrial":  [.10,.07,.05,.04,.08,.20,.65,.92,.98,.88,.72,.62,.70,.68,.65,.68,.90,.95,.82,.52,.36,.26,.18,.12],
}


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    return R * 2 * np.arcsin(np.sqrt(a))


def build_temporal_features(time_index: pd.DatetimeIndex) -> np.ndarray:
    """Returns [T, 6] — hour_sin/cos, dow_sin/cos, is_weekend, month_norm."""
    return np.stack([
        np.sin(2 * np.pi * time_index.hour / 24),
        np.cos(2 * np.pi * time_index.hour / 24),
        np.sin(2 * np.pi * time_index.dayofweek / 7),
        np.cos(2 * np.pi * time_index.dayofweek / 7),
        (time_index.dayofweek >= 5).astype(float),
        (time_index.month - 1) / 11.0,
    ], axis=1).astype(np.float32)


def build_spatial_features(lats, lons, city_center) -> np.ndarray:
    """Returns [Z, 3] — dist_norm, lat_norm, lon_norm."""
    dist = np.array([haversine_km(lat, lon, *city_center) for lat, lon in zip(lats, lons)])
    return np.stack([
        (dist  - dist.mean())  / (dist.std()  + 1e-8),
        (lats  - lats.mean())  / (lats.std()  + 1e-8),
        (lons  - lons.mean())  / (lons.std()  + 1e-8),
    ], axis=1).astype(np.float32)


def build_feature_tensor(
    wide_df:      pd.DataFrame,
    lats:         np.ndarray,
    lons:         np.ndarray,
    city_id:      str = "delhi_ncr",
    scaler:       StandardScaler | None = None,
):
    """
    Build X [T, Z, F] and normalised demand [T, Z].

    F = 1 (demand) + 6 (temporal) + 3 (spatial) = 10
    """
    T, Z = wide_df.shape
    city_center = CITY_CENTERS.get(city_id, (28.6315, 77.2167))

    demand_raw = wide_df.values.astype(np.float32)
    if scaler is None:
        scaler = StandardScaler()
        demand_norm = scaler.fit_transform(demand_raw).astype(np.float32)
    else:
        demand_norm = scaler.transform(demand_raw).astype(np.float32)

    temp  = build_temporal_features(pd.DatetimeIndex(wide_df.index))     # [T, 6]
    spat  = build_spatial_features(lats, lons, city_center)               # [Z, 3]

    temp3d = np.repeat(temp[:, np.newaxis, :], Z, axis=1)                 # [T, Z, 6]
    spat3d = np.repeat(spat[np.newaxis, :, :], T, axis=0)                 # [T, Z, 3]
    dem3d  = demand_norm[:, :, np.newaxis]                                 # [T, Z, 1]

    X = np.concatenate([dem3d, temp3d, spat3d], axis=2)                  # [T, Z, 10]
    print(f"[features] Tensor shape: {X.shape}  (T × Z × F={X.shape[2]})")
    return X, demand_norm, scaler


# ── Dataset ────────────────────────────────────────────────────────────────
class DemandDataset(Dataset):
    def __init__(self, X: np.ndarray, demand: np.ndarray, window: int = 12, horizon: int = 1):
        self.X       = torch.tensor(X,      dtype=torch.float32)
        self.demand  = torch.tensor(demand, dtype=torch.float32)
        self.window  = window
        self.horizon = horizon

    def __len__(self):
        return len(self.X) - self.window - self.horizon + 1

    def __getitem__(self, i):
        x = self.X[i : i + self.window]
        y = self.demand[i + self.window + self.horizon - 1]
        return x, y


def make_dataloaders(X, demand, window=12, horizon=1, batch_size=32,
                     train_frac=0.70, val_frac=0.15):
    ds = DemandDataset(X, demand, window, horizon)
    n  = len(ds)
    n_train = int(n * train_frac)
    n_val   = int(n * val_frac)
    n_test  = n - n_train - n_val

    train = torch.utils.data.Subset(ds, range(0, n_train))
    val   = torch.utils.data.Subset(ds, range(n_train, n_train + n_val))
    test  = torch.utils.data.Subset(ds, range(n_train + n_val, n))

    print(f"[data] train={n_train}  val={n_val}  test={n_test}")

    def loader(subset, shuffle):
        return DataLoader(subset, batch_size=batch_size, shuffle=shuffle,
                          num_workers=0, pin_memory=torch.cuda.is_available())

    return loader(train, True), loader(val, False), loader(test, False)
