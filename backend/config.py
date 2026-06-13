from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # .env loaded first, .secrets overrides — neither is required
        env_file=(".env", ".secrets"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Green Hackathon Project"
    debug: bool = False

    # Defaults to SQLite for local dev; set DATABASE_URL in .secrets for prod
    database_url: str = "sqlite+aiosqlite:///./db.sqlite3"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Add API keys here, e.g.:
    # openai_api_key: str = ""

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> object:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


settings = Settings()
