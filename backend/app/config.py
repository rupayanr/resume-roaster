from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    # LLM
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    # Server
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]
    max_file_size_mb: int = 5

    # Database
    database_url: str = "postgresql+asyncpg://roaster:roaster_secret@localhost:5433/resume_roaster"

    # Auth
    secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days


@lru_cache
def get_settings() -> Settings:
    return Settings()
