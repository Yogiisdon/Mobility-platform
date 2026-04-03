"""api/cities.py"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_session, City

router = APIRouter()

@router.get("/")
async def list_cities(session: AsyncSession = Depends(get_session)):
    cities = (await session.execute(select(City))).scalars().all()
    return [{"id": c.id, "name": c.name, "lat": c.lat, "lon": c.lon,
             "zoom": c.zoom, "tier": c.tier, "state": c.state} for c in cities]

@router.get("/{city_id}")
async def get_city(city_id: str, session: AsyncSession = Depends(get_session)):
    city = await session.get(City, city_id)
    if not city:
        from fastapi import HTTPException
        raise HTTPException(404, f"City {city_id!r} not found")
    return city
