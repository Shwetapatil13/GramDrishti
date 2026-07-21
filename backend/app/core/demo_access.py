import logging
from fastapi import Request
from app.core.config import settings
from datetime import datetime

logger = logging.getLogger(__name__)

def is_demo_mode_enabled() -> bool:
    """Check if the global demo mode flag is active."""
    return settings.DEMO_MODE and bool(settings.DEMO_TOKEN)

def is_demo_request(request: Request) -> bool:
    """Check if a specific request possesses the valid demo token."""
    if not is_demo_mode_enabled():
        return False
        
    token = request.headers.get("X-Demo-Token")
    return token == settings.DEMO_TOKEN

def should_bypass_limits(request: Request) -> bool:
    """
    Evaluates if the request should bypass quotas, rate limits, and cost tracking.
    Also logs the bypass event as required by security guidelines.
    """
    if is_demo_request(request):
        # Determine client IP for logging
        client_ip = request.client.host if request.client else "unknown"
        if "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0]
            
        logger.info(
            "Demo bypass triggered",
            extra={
                "demo_mode": True,
                "endpoint": request.url.path,
                "client_ip": client_ip,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        return True
    return False
