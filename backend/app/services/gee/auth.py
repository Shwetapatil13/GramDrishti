"""
Google Earth Engine authentication using service account credentials.
Called once at application startup.
"""
import ee
from pathlib import Path
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


GEE_STATE = {
    "status": "uninitialized",
    "error": None
}


def get_gee_state() -> dict:
    return GEE_STATE


def initialize_gee() -> None:
    """
    Initialize GEE with service account credentials.
    Skips initialization if USE_MOCK_DATA is True.
    Raises RuntimeError on auth failure (startup should fail loudly).
    """
    global GEE_STATE
    if settings.USE_MOCK_DATA:
        logger.info("Mock mode enabled — skipping GEE initialization")
        GEE_STATE = {"status": "mock", "error": None}
        return

    base_dir = Path(__file__).parent.parent.parent.parent
    credentials_path = base_dir / settings.GEE_CREDENTIALS_PATH
    if not credentials_path.exists():
        err = f"GEE credentials not found at {credentials_path}"
        logger.critical(err)
        GEE_STATE = {"status": "not_initialized", "error": err}
        raise RuntimeError(err)

    try:
        credentials = ee.ServiceAccountCredentials(
            settings.GEE_SERVICE_ACCOUNT_EMAIL,
            str(credentials_path)
        )
        ee.Initialize(credentials, project=settings.GEE_PROJECT_ID)
        logger.info("Google Earth Engine initialized successfully")
        GEE_STATE = {"status": "initialized", "error": None}
    except Exception as e:
        err = f"Failed to initialize Earth Engine: {str(e)}"
        logger.critical(err)
        GEE_STATE = {"status": "not_initialized", "error": err}
        raise RuntimeError(err)
