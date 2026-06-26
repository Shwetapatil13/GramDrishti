from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import get_logger
from app.api.routes import health, villages, satellite, analysis, weather, scores, history, ai, recommendations

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
    try:
        initialize_gee()
    except Exception as e:
        logger.error(f"Failed to initialize GEE on startup: {str(e)}")

app.include_router(health.router, prefix="/api/v1")
app.include_router(villages.router, prefix="/api/v1")
app.include_router(satellite.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(weather.router, prefix="/api/v1")
app.include_router(scores.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(recommendations.router, prefix="/api/v1")