"""
api/websocket.py — Real-time demand streaming via WebSocket
"""
import asyncio, json, time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ml.inference import get_predictor
from app.core.config import settings

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)


manager = ConnectionManager()


@router.websocket("/demand/{city_id}")
async def demand_stream(ws: WebSocket, city_id: str = "delhi_ncr"):
    await manager.connect(ws)
    predictor = get_predictor()
    try:
        while True:
            payload = predictor.predict(city_id)
            await ws.send_json({
                "type":      "demand_update",
                "city_id":   city_id,
                "timestamp": payload["timestamp"],
                "predictions": payload["predictions"],
                "metrics":     payload["metrics"],
            })
            await asyncio.sleep(settings.WS_INTERVAL_SECONDS)
    except WebSocketDisconnect:
        manager.disconnect(ws)


@router.websocket("/ping")
async def ping(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"pong:{data}")
    except WebSocketDisconnect:
        pass
