"""
api/predictions.py — Demand prediction endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import numpy as np

from app.db.session import get_session, DemandRecord, Zone
from app.ml.inference import get_predictor

router = APIRouter()


class PredictRequest(BaseModel):
    city_id:  str = "delhi_ncr"
    zone_ids: Optional[list[str]] = None  # None = all zones


class ZonePrediction(BaseModel):
    zone_id:    str
    zone_name:  str
    demand:     int
    predicted:  int
    delta:      int
    delta_pct:  float
    confidence: float
    tier:       str   # high / medium / low


class PredictResponse(BaseModel):
    timestamp:   str
    city_id:     str
    predictions: list[ZonePrediction]
    metrics:     dict


@router.get("/latest", response_model=PredictResponse)
async def predict_latest(
    city_id: str = Query(default="delhi_ncr"),
    session: AsyncSession = Depends(get_session),
):
    predictor = get_predictor()
    result    = predictor.predict(city_id)
    return result


@router.post("/", response_model=PredictResponse)
async def predict(req: PredictRequest, session: AsyncSession = Depends(get_session)):
    predictor = get_predictor()
    result    = predictor.predict(req.city_id, req.zone_ids)
    return result


@router.get("/history/{zone_id}")
async def zone_history(
    zone_id: str,
    last_n:  int = Query(default=48, le=96),
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(DemandRecord)
        .where(DemandRecord.zone_id == zone_id)
        .order_by(desc(DemandRecord.time_bin))
        .limit(last_n)
    )
    rows = (await session.execute(stmt)).scalars().all()
    return {
        "zone_id": zone_id,
        "records": [
            {"time": r.time_bin.isoformat(), "demand": r.demand, "predicted": r.predicted}
            for r in reversed(rows)
        ],
    }


@router.get("/metrics")
async def model_metrics(session: AsyncSession = Depends(get_session)):
    predictor = get_predictor()
    return predictor.get_metrics()
