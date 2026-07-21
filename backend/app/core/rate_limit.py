import time
import asyncio
from typing import Dict, Tuple, Callable
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.demo_access import should_bypass_limits
import logging

logger = logging.getLogger(__name__)

# Basic in-memory store for rate limits
# Format: { "ip:endpoint_group": (request_count, reset_timestamp) }
_rate_limits: Dict[str, Tuple[int, float]] = {}
_lock = asyncio.Lock()

# Define rate limits (requests per minute)
RATE_LIMITS = {
    "villages": 60,
    "satellite": 20,
    "weather": 40,
    "ai": 10,
    "farms": 30,
    "default": 100
}

def get_endpoint_group(path: str) -> str:
    """Map a request path to a rate limit group."""
    if "/villages/" in path and "/farms" not in path:
        return "villages"
    if "/satellite/" in path:
        return "satellite"
    if "/weather/" in path:
        return "weather"
    if "/ai/" in path:
        return "ai"
    if "/farms" in path:
        return "farms"
    return "default"

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting for static/docs
        if request.url.path.startswith(("/docs", "/openapi.json", "/redoc")):
            return await call_next(request)
            
        # 1. Developer Bypass Check
        if should_bypass_limits(request):
            return await call_next(request)
            
        # 2. Extract IP and endpoint group
        client_ip = request.client.host if request.client else "unknown"
        if "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0]
            
        group = get_endpoint_group(request.url.path)
        limit = RATE_LIMITS.get(group, RATE_LIMITS["default"])
        
        # We use a 60-second window
        window_size = 60.0
        now = time.time()
        key = f"{client_ip}:{group}"
        
        async with _lock:
            # Cleanup and check limit
            if key in _rate_limits:
                count, reset_time = _rate_limits[key]
                if now > reset_time:
                    # Window expired, reset
                    _rate_limits[key] = (1, now + window_size)
                elif count >= limit:
                    # Rate limit exceeded
                    retry_after = int(reset_time - now)
                    logger.warning(f"Rate limit exceeded for {key}. Limit: {limit}")
                    
                    return JSONResponse(
                        status_code=429,
                        content={
                            "success": False,
                            "error": {
                                "code": "RATE_LIMIT_EXCEEDED",
                                "message": f"Too many requests for {group}. Please try again later.",
                                "retry_after": max(1, retry_after)
                            }
                        },
                        headers={"Retry-After": str(max(1, retry_after))}
                    )
                else:
                    # Increment count
                    _rate_limits[key] = (count + 1, reset_time)
            else:
                _rate_limits[key] = (1, now + window_size)
                
        # 3. Process the request
        return await call_next(request)
