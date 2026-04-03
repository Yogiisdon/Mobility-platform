"""
api/zones.py
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_session, Zone, City

router = APIRouter()


@router.get("/")
async def list_zones(
    city_id: str = Query(default="delhi_ncr"),
    session: AsyncSession = Depends(get_session),
):
    stmt  = select(Zone).where(Zone.city_id == city_id)
    zones = (await session.execute(stmt)).scalars().all()
    return [
        {"id": z.id, "name": z.name, "lat": z.lat, "lon": z.lon,
         "region": z.region, "type": z.zone_type,
         "base_demand": z.base_demand, "peak_mult": z.peak_mult}
        for z in zones
    ]


@router.get("/{zone_id}")
async def get_zone(zone_id: str, session: AsyncSession = Depends(get_session)):
    zone = await session.get(Zone, zone_id)
    if not zone:
        from fastapi import HTTPException
        raise HTTPException(404, f"Zone {zone_id!r} not found")
    return zone
