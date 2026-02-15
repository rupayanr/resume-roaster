import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache


def generate_default_secret() -> str:
    """Generate a random secret for development only."""
    return secrets.token_hex(32)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    # LLM (Groq) - REQUIRED, no default
    groq_api_key: str = Field(..., description="Groq API key (required)")
    groq_model: str = "llama-3.1-70b-versatile"

    # Server
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]
    max_file_size_mb: int = 5

    # Database - REQUIRED in production
    database_url: str = Field(
        default="postgresql+asyncpg://roaster:roaster_secret@localhost:5433/resume_roaster",
        description="Database URL (use env var in production)"
    )

    # Secret key - generates random default for dev, MUST be set in production
    secret_key: str = Field(
        default_factory=generate_default_secret,
        description="Secret key for sessions (set via env var in production)"
    )

    # Rate limiting
    rate_limit_per_minute: int = 10  # Max uploads per minute per IP
    rate_limit_burst: int = 5  # Burst allowance


@lru_cache
def get_settings() -> Settings:
    return Settings()
