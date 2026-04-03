# MobilityIQ — Urban Demand Forecasting Platform

> A TradingView-style real-time dashboard for predicting ride-sharing demand across Indian cities using Graph Neural Networks.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi) ![PyTorch](https://img.shields.io/badge/PyTorch-2.1-EE4C2C?logo=pytorch) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React (Vite)  ·  Tailwind  ·  Recharts  ·  Leaflet    │
│  Zustand state  ·  Framer Motion  ·  Socket.io-client   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────▼─────────────────────────────────┐
│              FastAPI  (Python 3.11)                      │
│  /api/v1/predictions  /zones  /cities                   │
│  /ws/demand/{city_id}  ← real-time stream               │
└─────────┬─────────────────────────┬─────────────────────┘
          │                         │
┌─────────▼──────────┐   ┌──────────▼──────────────────────┐
│  GNN + LSTM Model  │   │  PostgreSQL + PostGIS            │
│  PyTorch Geometric │   │  cities · zones · demand_records │
│  Graph attention   │   │  model_runs                      │
└────────────────────┘   └─────────────────────────────────┘
```

## Project Structure

```
mobility-platform/
├── frontend/               React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/     Header, Toolbar (TradingView-style)
│   │   │   ├── Map/        Leaflet map, zone popups, time overlay
│   │   │   ├── Charts/     Recharts demand, forecast, error charts
│   │   │   ├── ZoneList/   Left panel with insights + sortable list
│   │   │   ├── Sidebar/    Right detail panel (forecast/actual/alerts)
│   │   │   └── Alerts/     Toast notification system
│   │   ├── pages/          Overview · ZoneDetails · ModelQuality · Cities
│   │   ├── store/          Zustand global state
│   │   ├── hooks/          useSocket (WebSocket), useApi
│   │   ├── data/           City + zone static data (22 cities)
│   │   └── utils/          colors.js, api.js
│   └── Dockerfile
│
├── backend/                FastAPI application
│   └── app/
│       ├── api/            predictions, zones, cities, websocket
│       ├── core/           config, settings
│       ├── db/             SQLAlchemy models + async session
│       ├── ml/             inference engine (loads GNN checkpoint)
│       └── main.py
│
├── ml/                     Machine learning pipeline
│   ├── models/             st_model.py (GNN+LSTM), gnn_layers.py
│   ├── preprocessing/      data_generator.py, features.py, graph_builder.py
│   ├── training/           trainer.py (end-to-end train script)
│   └── evaluation/         metrics.py (MAE, RMSE, MAPE)
│
├── database/
│   └── seed.py             Initial city + zone data seeding
│
└── docker-compose.yml      Full stack orchestration
```

## Quick Start

### Option 1 — Docker (recommended)

```bash
# Clone and start everything
git clone <repo>
cd mobility-platform
docker-compose up --build

# Seed the database (once)
docker exec mobility_api python -m database.seed
```

Open http://localhost:3000

### Option 2 — Local development

**Prerequisites:** Node 20+, Python 3.11+, PostgreSQL 16

```bash
# 1. Database
createdb mobility_db
# Update DATABASE_URL in backend/.env

# 2. Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# In another terminal — seed DB
python -m database.seed

# 3. Frontend
cd frontend
npm install
npm run dev         # → http://localhost:3000
```

### Train the ML model

```bash
cd mobility-platform
pip install -r backend/requirements.txt

# Train on Delhi NCR (generates synthetic data automatically)
python -m ml.training.trainer --city delhi_ncr --epochs 60

# Train on Mumbai
python -m ml.training.trainer --city mumbai --epochs 60 --gnn gat

# Checkpoint saved to: checkpoints/delhi_ncr_best_model.pt
```

## Features

### Frontend
| Feature | Description |
|---------|-------------|
| **TradingView layout** | Header tabs · toolbar · left zone list · map · right detail panel |
| **22 Indian cities** | Tier-1 metros + Tier-2 cities, switchable via city dropdown |
| **Live demand map** | Colour-coded zones (blue→green→amber→red) with animated circles |
| **Zone detail panel** | Forecast chart · Actual vs Predicted · Error timeline |
| **Model metrics** | MAE / RMSE / MAPE with hover tooltips + trend indicators |
| **Alerts system** | Per-zone threshold alerts with toast notifications |
| **Time controls** | Time slider · play/pause · horizon (Live / +30m / +1h) |
| **Insights** | Auto-generated pattern observations per tick |
| **Pin & save** | Pin favourite zones · save / restore view state |
| **Filter + sort** | High/Medium/Low demand · Δ≥3 change · sort by demand/change/error |

### Backend
| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/predictions/latest?city_id=delhi_ncr` | Latest zone demand predictions |
| `POST /api/v1/predictions/` | Custom prediction with zone filter |
| `GET /api/v1/predictions/history/{zone_id}` | Historical demand records |
| `GET /api/v1/predictions/metrics` | Current MAE / RMSE / MAPE |
| `GET /api/v1/zones?city_id=delhi_ncr` | List zones for a city |
| `GET /api/v1/cities/` | All supported cities |
| `WS /ws/demand/{city_id}` | Real-time demand stream (2s interval) |

### ML Model

```
Input:  [B, T=12, Z=30, F=10]
          T = last 12 × 30-min intervals (6 hours)
          F = [demand, hour_sin, hour_cos, dow_sin, dow_cos,
               is_weekend, month, dist_to_centre, lat_norm, lon_norm]

GCN Layer 1  →  [B*Z, 64]   spatial aggregation
GCN Layer 2  →  [B*Z, 64]   deeper spatial
LayerNorm
LSTM ×2      →  [B*Z, 128]  temporal patterns
Dense Head   →  [B, Z]      demand prediction
```

**Graph strategies:** distance (< 4 km), demand correlation (r ≥ 0.65), or combined.

## Data Sources

The system works out-of-the-box with realistic synthetic data.  
For production, plug in real data:

| Source | What you get |
|--------|-------------|
| [NYC TLC](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page) | Pickup/dropoff lat/lon + timestamps (benchmark) |
| [Uber Movement](https://movement.uber.com/) | City-level zone demand + travel times |
| [OpenStreetMap](https://download.geofabrik.de/asia/india.html) | Road network for graph edges |
| [IMD Weather API](https://mausam.imd.gov.in/) | Temperature, rain — external features |
| [Google Maps Platform](https://developers.google.com/maps) | Real-time traffic conditions |
| KSRTC / DTC open data | Delhi, Bengaluru official trip records |

## Environment Variables

```env
# backend/.env
DATABASE_URL=postgresql+asyncpg://mobility:mobility@localhost:5432/mobility_db
MODEL_CHECKPOINT=checkpoints/delhi_ncr_best_model.pt
DEBUG=false

# frontend/.env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Animation | Framer Motion |
| Charts | Recharts |
| Map | Leaflet + react-leaflet |
| Real-time | WebSocket (native) |
| Backend | FastAPI + Uvicorn |
| ORM | SQLAlchemy 2 (async) |
| Database | PostgreSQL 16 + PostGIS |
| ML | PyTorch 2.1 |
| Graph ML | Custom GCN / GAT layers |
| Data | Pandas + NumPy + Scikit-learn |
| Container | Docker + Docker Compose |
