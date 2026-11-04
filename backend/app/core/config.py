from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TrendKart Hyperlocal Fashion Marketplace"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "trendkart-super-secret-jwt-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Supabase
    SUPABASE_URL: str = "https://itpeicndvdbhrgxenmrd.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Hyperlocal Defaults
    DEFAULT_MAX_DELIVERY_RADIUS_KM: float = 10.0
    DEFAULT_DELIVERY_SPEED_KMH: float = 25.0

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
