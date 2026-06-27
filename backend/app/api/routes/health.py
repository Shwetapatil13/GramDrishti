from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def get_health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "gee_initialized": not settings.USE_MOCK_DATA,  # Placeholder
        "mock_mode": settings.USE_MOCK_DATA
    }
