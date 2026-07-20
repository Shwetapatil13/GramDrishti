from typing import Any, Dict
from app.services.gee.registry import LAYER_REGISTRY
from app.services.gee.providers.base import LayerProvider
from app.core.exceptions import GEEDataError

# We will lazily load providers to avoid circular imports if any
_providers: Dict[str, LayerProvider] = {}

def get_provider_instance(provider_name: str) -> LayerProvider:
    if provider_name in _providers:
        return _providers[provider_name]
    
    if provider_name == "Sentinel2Provider":
        from app.services.gee.providers.sentinel2 import Sentinel2Provider
        _providers[provider_name] = Sentinel2Provider()
    elif provider_name == "Sentinel1Provider":
        from app.services.gee.providers.sentinel1 import Sentinel1Provider
        _providers[provider_name] = Sentinel1Provider()
    elif provider_name == "WaterProvider":
        # we can migrate water.py logic into a provider later, or use Sentinel2 for now
        from app.services.gee.providers.water import WaterProvider
        _providers[provider_name] = WaterProvider()
    else:
        raise GEEDataError(f"Unknown provider: {provider_name}")
        
    return _providers[provider_name]

class LayerFactory:
    """
    Dispatcher that routes requests to the appropriate LayerProvider
    based on the LAYER_REGISTRY.
    """
    
    @staticmethod
    def get_layer_metadata(layer_id: str) -> Dict[str, Any]:
        layer = LAYER_REGISTRY.get(layer_id)
        if not layer:
            raise GEEDataError(f"Layer {layer_id} not found in registry.")
        return layer

    @staticmethod
    def get_tiles(layer_id: str, boundary, start_date: str, end_date: str, cloud_pct: int = 20) -> Dict[str, str]:
        """
        Retrieves smooth map tiles for a given layer.
        """
        layer_meta = LayerFactory.get_layer_metadata(layer_id)
        provider_name = layer_meta["provider"]
        provider = get_provider_instance(provider_name)
        
        vis_params = layer_meta.get("visualization", {})
        
        # Here we could implement advanced caching based on the hash of inputs
        
        return provider.get_tiles(
            layer_id=layer_id,
            boundary=boundary,
            start_date=start_date,
            end_date=end_date,
            vis_params=vis_params,
            cloud_pct=cloud_pct
        )

    @staticmethod
    def get_statistics(layer_id: str, boundary, start_date: str, end_date: str, aggregation: str = 'mean', cloud_pct: int = 20) -> Dict[str, Any]:
        """
        Retrieves statistics for a given layer.
        """
        layer_meta = LayerFactory.get_layer_metadata(layer_id)
        provider_name = layer_meta["provider"]
        provider = get_provider_instance(provider_name)
        
        return provider.get_statistics(
            layer_id=layer_id,
            boundary=boundary,
            start_date=start_date,
            end_date=end_date,
            aggregation=aggregation,
            cloud_pct=cloud_pct
        )

    @staticmethod
    def get_pixel_value(layer_id: str, lat: float, lng: float, start_date: str, end_date: str, cloud_pct: int = 20, geometryId: str = None) -> Dict[str, Any]:
        """
        Retrieves the exact pixel value at the given coordinates.
        """
        layer_meta = LayerFactory.get_layer_metadata(layer_id)
        provider_name = layer_meta["provider"]
        provider = get_provider_instance(provider_name)
        
        return provider.get_pixel_value(
            layer_id=layer_id,
            lat=lat,
            lng=lng,
            start_date=start_date,
            end_date=end_date,
            cloud_pct=cloud_pct,
            geometryId=geometryId
        )
