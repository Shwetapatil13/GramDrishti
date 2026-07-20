import ee
from typing import Dict, Any
from app.services.gee.providers.base import LayerProvider
from app.core.exceptions import GEEDataError

class Sentinel1Provider(LayerProvider):
    """
    Provider for Sentinel-1 Radar Indices (SMI, RVI, RATIO, VV, VH)
    Uses COPERNICUS/S1_GRD
    """

    def _get_collection(self, boundary: ee.Geometry, start_date: str, end_date: str) -> ee.ImageCollection:
        collection = (ee.ImageCollection("COPERNICUS/S1_GRD")
                      .filterBounds(boundary)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.eq('instrumentMode', 'IW'))
                      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH')))
        
        if collection.size().getInfo() == 0:
            raise GEEDataError(f"No Sentinel-1 imagery found between {start_date} and {end_date}")
            
        return collection

    def _compute_index(self, image: ee.Image, layer_id: str) -> ee.Image:
        """
        Computes the requested radar index.
        """
        vv = image.select('VV')
        vh = image.select('VH')
        
        if layer_id == "VV":
            return vv.rename("VV")
            
        elif layer_id == "VH":
            return vh.rename("VH")
            
        elif layer_id == "RATIO":
            # VV/VH ratio in dB = VV_dB - VH_dB (subtraction in dB == division in linear)
            return vv.subtract(vh).rename("RATIO")
            
        elif layer_id == "RVI":
            # RVI = 4 * VH_linear / (VV_linear + VH_linear)
            # Must convert dB to linear power first: linear = 10 ^ (dB / 10)
            vv_lin = ee.Image(10.0).pow(vv.divide(10.0))
            vh_lin = ee.Image(10.0).pow(vh.divide(10.0))
            rvi = vh_lin.multiply(4.0).divide(vv_lin.add(vh_lin)).clamp(0.0, 1.0).rename("RVI")
            return rvi
            
        elif layer_id == "SMI":
            # SMI = (VV - VV_dry) / (VV_wet - VV_dry), clamped to [0, 1]
            # Dry = -20 dB, Wet = -8 dB, span = 12
            smi = image.expression(
                '(VV + 20.0) / 12.0', {
                    'VV': vv
                }).clamp(0.0, 1.0).rename('SMI')
            return smi
            
        else:
            raise GEEDataError(f"Unsupported index {layer_id} in Sentinel1Provider")

    def get_image(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, cloud_pct: int = 20) -> ee.Image:
        # Note: cloud_pct is ignored for Radar (Sentinel-1 penetrates clouds)
        collection = self._get_collection(boundary, start_date, end_date)
        # We use median composite for radar to reduce speckle noise.
        # DO NOT clip here before smoothing, or focal_mean will eat the edges.
        median_image = collection.median()
        index_image = self._compute_index(median_image, layer_id)
        return index_image

    def get_tiles(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, vis_params: Dict[str, Any], cloud_pct: int = 20) -> Dict[str, str]:
        try:
            image = self.get_image(layer_id, boundary, start_date, end_date)
            
            # Adaptive percentile contrast stretching (2nd–98th percentile).
            try:
                percentiles = image.reduceRegion(
                    reducer=ee.Reducer.percentile([2, 98]),
                    geometry=boundary,
                    scale=30,
                    maxPixels=1e8
                ).getInfo()
                
                p2_key = f"{layer_id}_p2"
                p98_key = f"{layer_id}_p98"
                p2 = percentiles.get(p2_key)
                p98 = percentiles.get(p98_key)
                
                if p2 is not None and p98 is not None and p98 > p2:
                    vis_params = dict(vis_params)
                    vis_params['min'] = float(p2)
                    vis_params['max'] = float(p98)
            except Exception:
                pass

            # Legacy smoothing chain
            if vis_params.get("smoothing", False):
                image = (image
                         .resample('bicubic')
                         .reproject(crs='EPSG:4326', scale=10)
                         .focal_mean(2, 'circle', 'pixels'))
            
            # Clip LAST
            image = image.clip(boundary)

            # Remove smoothing from vis_params before passing to GEE
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
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            return {
                "layer": layer_id,
                "mean": stats.get(f"{layer_id}_mean"),
                "median": stats.get(f"{layer_id}_median"),
                "min": stats.get(f"{layer_id}_min"),
                "max": stats.get(f"{layer_id}_max"),
                "stdDev": stats.get(f"{layer_id}_stdDev"),
                "pixelCount": stats.get(f"{layer_id}_count")
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
                scale=10,
                numPixels=1,
                geometries=False
            ).getInfo()
            
            features = sampled.get('features', [])
            if not features:
                return {"layer": layer_id, "value": None}
                
            value = features[0].get('properties', {}).get(layer_id)
            return {"layer": layer_id, "value": value}
        except Exception as e:
            raise GEEDataError(f"Error fetching pixel value for {layer_id}: {str(e)}")
