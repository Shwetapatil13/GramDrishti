"""
Google Earth Engine authentication using service account credentials.
Called once at application startup.
"""
import ee
from pathlib import Path
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def initialize_gee() -> None:
    """
    Initialize GEE with service account credentials.
    Skips initialization if USE_MOCK_DATA is True.
    Raises RuntimeError on auth failure (startup should fail loudly).
    """
    if settings.USE_MOCK_DATA:
        logger.info("Mock mode enabled — skipping GEE initialization")
        return

    base_dir = Path(__file__).parent.parent.parent.parent
    credentials_path = base_dir / settings.GEE_CREDENTIALS_PATH
    if not credentials_path.exists():
        raise RuntimeError(f"GEE credentials not found at {credentials_path}")

    try:
        credentials = ee.ServiceAccountCredentials(
            settings.GEE_SERVICE_ACCOUNT_EMAIL,
            str(credentials_path)
        )
        ee.Initialize(credentials, project=settings.GEE_PROJECT_ID)
        logger.info("Google Earth Engine initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Earth Engine: {str(e)}")
        raise RuntimeError(f"Failed to initialize Earth Engine: {str(e)}")
