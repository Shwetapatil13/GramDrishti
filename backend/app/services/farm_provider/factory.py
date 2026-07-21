import os
import logging
from app.services.farm_provider.provider import FarmProvider
from app.services.farm_provider.agstack_provider import AgStackProvider
from app.services.farm_provider.mock_provider import MockFarmProvider

logger = logging.getLogger(__name__)

class FarmProviderFactory:
    """
    Factory to retrieve the active FarmProvider based on environment configuration.
    """
    _instance: FarmProvider = None

    @classmethod
    def get_provider(cls) -> FarmProvider:
        if cls._instance is not None:
            return cls._instance
            
        provider_name = os.getenv("FARM_PROVIDER", "agstack").lower()
        
        if provider_name == "mock":
            logger.warning("Initializing MockFarmProvider. This should only be used in development.")
            cls._instance = MockFarmProvider()
        elif provider_name == "agstack":
            logger.info("Initializing AgStackProvider for production.")
            cls._instance = AgStackProvider()
        else:
            logger.warning(f"Unknown farm provider '{provider_name}'. Falling back to MockFarmProvider.")
            cls._instance = MockFarmProvider()
            
        return cls._instance
