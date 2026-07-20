import ee
from typing import Dict, Any
from app.services.gee.providers.base import LayerProvider
from app.core.exceptions import GEEDataError

class WaterProvider(LayerProvider):
    """
    Provider for Surface Water Occurrence (JRC/GSW1_4/GlobalSurfaceWater)
    """

    def get_image(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, cloud_pct: int = 20) -> ee.Image:
        # For water occurrence, we use the base JRC dataset
        jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
        occurrence = jrc.select('occurrence')
        water_mask = occurrence.gt(0)
        return occurrence.updateMask(water_mask)

    def get_tiles(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, vis_params: Dict[str, Any], cloud_pct: int = 20) -> Dict[str, str]:
        try:
            image = self.get_image(layer_id, boundary, start_date, end_date)
            
            if vis_params.get("smoothing", False):
                image = image.resample('bicubic').focal_mean(20, 'circle', 'meters')
                
            # Clip LAST
            image = image.clip(boundary)
                
            gee_vis = {k: v for k, v in vis_params.items() if k != "smoothing" and k != "opacity"}
            
            map_id_dict = image.getMapId(gee_vis)
            return {
                "urlFormat": map_id_dict['tile_fetcher'].url_format
            }
        except ee.EEException as e:
            raise GEEDataError(f"Earth Engine error generating {layer_id} tiles: {str(e)}")

    def get_statistics(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, aggregation: str = 'mean', cloud_pct: int = 20) -> Dict[str, Any]:
        try:
            image = self.get_image(layer_id, boundary, start_date, end_date, cloud_pct)
            
            reducer = (ee.Reducer.mean()
                       .combine(ee.Reducer.minMax(), sharedInputs=True)
                       .combine(ee.Reducer.median(), sharedInputs=True)
                       .combine(ee.Reducer.stdDev(), sharedInputs=True)
                       .combine(ee.Reducer.count(), sharedInputs=True))
                       
            stats = image.reduceRegion(
                reducer=reducer,
                geometry=boundary,
                scale=30,
                maxPixels=1e9
            ).getInfo()
            
            return {
                "layer": layer_id,
                "mean": stats.get(f"occurrence_mean"),
                "median": stats.get(f"occurrence_median"),
                "min": stats.get(f"occurrence_min"),
                "max": stats.get(f"occurrence_max"),
                "stdDev": stats.get(f"occurrence_stdDev"),
                "pixelCount": stats.get(f"occurrence_count")
            }
        except Exception as e:
            raise GEEDataError(f"Error computing statistics for {layer_id}: {str(e)}")

    def get_pixel_value(self, layer_id: str, lat: float, lng: float, start_date: str, end_date: str, cloud_pct: int = 20) -> Dict[str, Any]:
        """
        Sample the exact pixel value at the given coordinate.
        """
        try:
            point = ee.Geometry.Point([lng, lat])
            image = self.get_image(layer_id, point, start_date, end_date, cloud_pct)
            
            sampled = image.sample(
                region=point,
                scale=30,
                numPixels=1,
                geometries=False
            ).getInfo()
            
            features = sampled.get('features', [])
            if not features:
                return {"layer": layer_id, "value": None}
                
            value = features[0].get('properties', {}).get('occurrence')
            return {"layer": layer_id, "value": value}
        except Exception as e:
            raise GEEDataError(f"Error fetching pixel value for {layer_id}: {str(e)}")
