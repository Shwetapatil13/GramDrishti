from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    GEE_PROJECT_ID: str = ""
    GEE_SERVICE_ACCOUNT_EMAIL: str = ""
    GEE_CREDENTIALS_PATH: str = "./credentials/gee_credentials.json"
    GEMINI_API_KEY: str = ""
    OPENMETEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    DEBUG: bool = True
    USE_MOCK_DATA: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()