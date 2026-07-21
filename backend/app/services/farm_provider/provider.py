from abc import ABC, abstractmethod
from typing import Dict, Any

class FarmProvider(ABC):
    """
    Base interface for farm field boundary providers.
    """
    
    @abstractmethod
    async def get_farms_for_village(self, village_id: str, boundary_geojson: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieves farm polygons intersecting the given village boundary.
        Must return a valid GeoJSON FeatureCollection.
        """
        pass
