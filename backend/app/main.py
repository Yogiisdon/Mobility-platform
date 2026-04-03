"""
backend/app/main.py
FastAPI application — Urban Mobility Demand Forecasting API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import predictions, zones, cities, websocket as ws_router
from app.core.config import settings
from app.db.session import init_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up MobilityIQ API…")
    await init_db()
    yield
    logger.info("Shutting down…")


app = FastAPI(
    title="MobilityIQ API",
    description="Urban Mobility Demand Forecasting — Graph Neural Network Engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(zones.router,       prefix="/api/v1/zones",       tags=["zones"])
app.include_router(cities.router,      prefix="/api/v1/cities",      tags=["cities"])
app.include_router(ws_router.router,   prefix="/ws",                 tags=["websocket"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/")
async def root():
    return {"message": "MobilityIQ API", "docs": "/docs"}
