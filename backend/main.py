from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import get_logger
from app.api.routes import health, villages

logger = get_logger(__name__)

app = FastAPI(title="GramDrishti API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    if settings.USE_MOCK_DATA:
        logger.info("Mock mode enabled — skipping GEE initialization")
    else:
        logger.info("GEE initialization not implemented yet")

app.include_router(health.router, prefix="/api/v1")
app.include_router(villages.router, prefix="/api/v1")