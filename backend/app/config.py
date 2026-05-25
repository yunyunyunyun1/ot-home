from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ot@home"
    app_env: str = "local"
    database_url: str
    secret_key: str = "change-this-secret-key-before-production"
    access_token_expire_minutes: int = 60
    first_admin_thai_id: str = ""
    first_admin_password: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
