"""
app/db/session.py — SQLAlchemy async session + models
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Index, func
from datetime import datetime
from typing import Optional, AsyncGenerator
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, pool_size=10)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# ── ORM Models ──────────────────────────────────────────────────────────────
class City(Base):
    __tablename__ = "cities"
    id:    Mapped[str]   = mapped_column(String(64), primary_key=True)
    name:  Mapped[str]   = mapped_column(String(128))
    lat:   Mapped[float] = mapped_column(Float)
    lon:   Mapped[float] = mapped_column(Float)
    zoom:  Mapped[int]   = mapped_column(Integer, default=11)
    tier:  Mapped[int]   = mapped_column(Integer, default=1)
    state: Mapped[str]   = mapped_column(String(64))
    zones: Mapped[list["Zone"]] = relationship(back_populates="city")


class Zone(Base):
    __tablename__ = "zones"
    id:       Mapped[str]   = mapped_column(String(128), primary_key=True)
    city_id:  Mapped[str]   = mapped_column(ForeignKey("cities.id"))
    name:     Mapped[str]   = mapped_column(String(128))
    lat:      Mapped[float] = mapped_column(Float)
    lon:      Mapped[float] = mapped_column(Float)
    region:   Mapped[str]   = mapped_column(String(64))
    zone_type:Mapped[str]   = mapped_column(String(32))
    base_demand: Mapped[int]   = mapped_column(Integer, default=50)
    peak_mult:   Mapped[float] = mapped_column(Float, default=1.0)
    city:     Mapped["City"]  = relationship(back_populates="zones")
    demands:  Mapped[list["DemandRecord"]] = relationship(back_populates="zone")


class DemandRecord(Base):
    __tablename__ = "demand_records"
    id:        Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    zone_id:   Mapped[str]      = mapped_column(ForeignKey("zones.id"))
    time_bin:  Mapped[datetime] = mapped_column(DateTime(timezone=True))
    demand:    Mapped[int]      = mapped_column(Integer)
    predicted: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    zone:      Mapped["Zone"]   = relationship(back_populates="demands")

    __table_args__ = (
        Index("ix_demand_zone_time", "zone_id", "time_bin"),
    )


class ModelRun(Base):
    __tablename__ = "model_runs"
    id:        Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    mae:       Mapped[float] = mapped_column(Float)
    rmse:      Mapped[float] = mapped_column(Float)
    mape:      Mapped[float] = mapped_column(Float)
    city_id:   Mapped[str]   = mapped_column(String(64))
    notes:     Mapped[Optional[str]] = mapped_column(String(512), nullable=True)


# ── Session dependency ──────────────────────────────────────────────────────
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
