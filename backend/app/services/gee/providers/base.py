from typing import Any, Dict, Optional, List
from abc import ABC, abstractmethod
import ee

class LayerProvider(ABC):
    """
    Common interface for all geospatial data providers.
    Every provider (Sentinel-2, Sentinel-1, Weather, etc.) must implement this contract.
    """

    @abstractmethod
    def get_image(self, 
                  layer_id: str, 
                  boundary: ee.Geometry, 
                  start_date: str, 
                  end_date: str, 
                  cloud_pct: int = 20) -> ee.Image:
        """
        Fetch and process the underlying Earth Engine Image.
        """
        pass

    @abstractmethod
    def get_tiles(self, 
                  layer_id: str, 
                  boundary: ee.Geometry, 
                  start_date: str, 
                  end_date: str, 
                  vis_params: Dict[str, Any],
                  cloud_pct: int = 20) -> Dict[str, str]:
        """
        Generate tile URL (MapId) for visualization.
        Must return a dict with a 'urlFormat' key.
        """
        pass

    @abstractmethod
    def get_statistics(self, 
                       layer_id: str, 
                       boundary: ee.Geometry, 
                       start_date: str, 
                       end_date: str, 
                       aggregation: str = 'mean',
                       cloud_pct: int = 20) -> Dict[str, Any]:
        """
        Compute statistics (mean, min, max, etc.) for the given region.
        """
        pass

    @abstractmethod
    def get_pixel_value(self, 
                        layer_id: str, 
                        lat: float, 
                        lng: float, 
                        start_date: str, 
                        end_date: str, 
                        cloud_pct: int = 20,
                        geometryId: str = None) -> Dict[str, Any]:
        """
        Sample the exact pixel value at the given coordinate.
        """
        pass
