from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MobilityIQ"
    DEBUG:    bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://mobility:mobility@localhost:5432/mobility_db"

    # ML
    MODEL_CHECKPOINT: str = "checkpoints/best_model.pt"
    WINDOW_SIZE:      int = 12
    FORECAST_STEPS:   int = 8
    GNN_HIDDEN:       int = 64
    LSTM_HIDDEN:      int = 128

    # WebSocket
    WS_INTERVAL_SECONDS: float = 2.0

    # Data
    DEFAULT_CITY: str = "delhi_ncr"
    TIME_BIN_MINUTES: int = 30

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
