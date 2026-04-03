"""
ml/preprocessing/data_generator.py
Generate realistic synthetic ride data for any Indian city.
Uses demand profiles calibrated to Delhi NCR patterns.
"""
import numpy as np
import pandas as pd
from pathlib import Path

CITY_CONFIG = {
    "delhi_ncr":  {"bounds": (28.35, 28.88, 76.84, 77.55), "n": 80_000},
    "mumbai":     {"bounds": (18.89, 19.27, 72.77, 73.03), "n": 75_000},
    "bengaluru":  {"bounds": (12.83, 13.14, 77.46, 77.76), "n": 70_000},
    "chennai":    {"bounds": (12.94, 13.22, 80.15, 80.33), "n": 55_000},
    "hyderabad":  {"bounds": (17.29, 17.56, 78.34, 78.60), "n": 58_000},
    "kolkata":    {"bounds": (22.43, 22.72, 88.26, 88.47), "n": 60_000},
    "pune":       {"bounds": (18.43, 18.62, 73.78, 73.96), "n": 48_000},
    "ahmedabad":  {"bounds": (22.96, 23.10, 72.50, 72.68), "n": 45_000},
}

# Hotspot weights — mirrors production zone metadata
HOTSPOT_WEIGHTS = {
    "delhi_ncr": [
        (28.6315, 77.2167, 1.85),  # Connaught Place
        (28.4950, 77.0880, 2.00),  # Cyber City
        (28.5700, 77.3200, 1.60),  # Noida Sec 18
        (28.5562, 77.1000, 1.80),  # IGI Airport
        (28.5270, 77.2190, 1.45),  # Saket
        (28.6510, 77.1900, 1.55),  # Karol Bagh
        (28.5921, 77.0595, 1.10),  # Dwarka
        (28.7490, 77.0670, 0.95),  # Rohini
    ],
}


def _default_hotspots(lat_min, lat_max, lon_min, lon_max):
    """Spread 8 hotspots across the city bounding box."""
    lats = np.linspace(lat_min + 0.05, lat_max - 0.05, 3)
    lons = np.linspace(lon_min + 0.05, lon_max - 0.05, 3)
    pts  = [(la, lo, 1.0 + np.random.rand() * 0.8)
            for la in lats for lo in lons][:8]
    return pts


def generate_rides(city_id: str = "delhi_ncr", n: int | None = None,
                   days: int = 30, seed: int = 42) -> pd.DataFrame:
    cfg = CITY_CONFIG.get(city_id, CITY_CONFIG["delhi_ncr"])
    n   = n or cfg["n"]
    lat_min, lat_max, lon_min, lon_max = cfg["bounds"]
    rng = np.random.default_rng(seed)

    # Timestamps
    start = pd.Timestamp("2024-01-01")
    end   = pd.Timestamp(f"2024-{1 + days // 30:02d}-{1 + days % 30:02d}")
    ts    = pd.to_datetime(rng.integers(start.value, end.value, size=n))

    # Hotspots
    hotspots = HOTSPOT_WEIGHTS.get(city_id) or _default_hotspots(lat_min, lat_max, lon_min, lon_max)
    coords   = np.array([(h[0], h[1]) for h in hotspots])
    weights  = np.array([h[2] for h in hotspots])
    weights /= weights.sum()

    idx      = rng.choice(len(hotspots), size=n, p=weights)
    base_lat = coords[idx, 0] + rng.normal(0, 0.018, n)
    base_lon = coords[idx, 1] + rng.normal(0, 0.018, n)

    # Rush-hour demand thinning
    hours      = pd.DatetimeIndex(ts).hour
    is_rush    = ((hours >= 7) & (hours <= 10)) | ((hours >= 17) & (hours <= 20))
    is_weekend = pd.DatetimeIndex(ts).dayofweek >= 5
    keep_prob  = np.where(is_rush, 1.0, np.where(is_weekend, 0.72, 0.55))
    mask       = rng.random(n) < keep_prob

    df = pd.DataFrame({
        "pickup_lat":    np.clip(base_lat[mask], lat_min, lat_max),
        "pickup_lon":    np.clip(base_lon[mask], lon_min, lon_max),
        "dropoff_lat":   np.clip(base_lat[mask] + rng.normal(0, 0.022, mask.sum()), lat_min, lat_max),
        "dropoff_lon":   np.clip(base_lon[mask] + rng.normal(0, 0.022, mask.sum()), lon_min, lon_max),
        "timestamp":     ts[mask],
        "trip_distance": np.abs(rng.normal(3.5, 2.0, mask.sum())).clip(0.5, 30),
        "fare_amount":   np.abs(rng.normal(85, 45, mask.sum())).clip(20, 800),
        "city_id":       city_id,
    })
    return df.reset_index(drop=True)


def assign_grid_zones(df: pd.DataFrame, grid_size: int = 20,
                      lat_col="pickup_lat", lon_col="pickup_lon") -> pd.DataFrame:
    """Assign each ride to a grid cell zone_id."""
    df = df.copy()
    lat_min, lat_max = df[lat_col].min(), df[lat_col].max()
    lon_min, lon_max = df[lon_col].min(), df[lon_col].max()
    lat_n = ((df[lat_col] - lat_min) / (lat_max - lat_min + 1e-9) * grid_size).astype(int).clip(0, grid_size - 1)
    lon_n = ((df[lon_col] - lon_min) / (lon_max - lon_min + 1e-9) * grid_size).astype(int).clip(0, grid_size - 1)
    df["zone_id"] = "zone_" + lat_n.astype(str).str.zfill(2) + "_" + lon_n.astype(str).str.zfill(2)
    return df


def build_demand_matrix(df: pd.DataFrame, freq: str = "30min",
                         min_zone_freq: int = 30) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Aggregate to [time_bins × zones] demand counts."""
    df["time_bin"] = pd.to_datetime(df["timestamp"]).dt.floor(freq)
    zone_counts    = df["zone_id"].value_counts()
    valid_zones    = zone_counts[zone_counts >= min_zone_freq].index
    df = df[df["zone_id"].isin(valid_zones)]

    long = df.groupby(["time_bin", "zone_id"]).size().reset_index(name="demand")
    wide = long.pivot(index="time_bin", columns="zone_id", values="demand").fillna(0).sort_index()
    print(f"[demand] Matrix: {wide.shape}  (time × zones)  mean={wide.values.mean():.1f}")
    return wide, long


if __name__ == "__main__":
    out = Path(__file__).parents[2] / "data"
    out.mkdir(exist_ok=True)
    for city in ["delhi_ncr", "mumbai", "bengaluru"]:
        print(f"\n── {city} ──")
        df = generate_rides(city)
        df = assign_grid_zones(df)
        wide, long = build_demand_matrix(df)
        wide.to_parquet(out / f"{city}_demand_wide.parquet")
        print(f"   Saved {city}_demand_wide.parquet")
