from fastapi import APIRouter
from app.core.config import settings
from app.services.gee.auth import get_gee_state

router = APIRouter()


@router.get("/health")
def get_health():
    gee_state = get_gee_state()
    return {
        "status": "ok",
        "version": "1.0.0",
        "gee_status": gee_state["status"],
        "gee_error": gee_state["error"],
        "gee_initialized": gee_state["status"] == "initialized",
        "mock_mode": settings.USE_MOCK_DATA,
        "gemini_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here")
    }
