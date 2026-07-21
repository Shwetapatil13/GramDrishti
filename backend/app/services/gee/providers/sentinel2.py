import ee
from typing import Dict, Any
from app.services.gee.providers.base import LayerProvider
from app.core.exceptions import GEEDataError

class Sentinel2Provider(LayerProvider):
    """
    Provider for Sentinel-2 Optical Indices (NDVI, EVI, SAVI, NDMI, GNDVI, CVI)
    """

    def _get_collection(self, boundary: ee.Geometry, start_date: str, end_date: str, cloud_pct: int) -> ee.ImageCollection:
        try:
            def mask_scl(image):
                scl = image.select('SCL')
                mask = ee.Image.constant(1)
                for bad_class in [3, 8, 9, 10]:
                    mask = mask.And(scl.neq(bad_class))
                return image.updateMask(mask)

            collection = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                          .filterBounds(boundary)
                          .filterDate(start_date, end_date)
                          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloud_pct))
                          .map(mask_scl)
                          .map(lambda img: img.clip(boundary))
                          .map(lambda img: img.divide(10000)))
            
            count = collection.size().getInfo()
            if count == 0:
                raise GEEDataError(f"No Sentinel-2 imagery found between {start_date} and {end_date} (cloud filter: {cloud_pct}%)")
            return collection
        except GEEDataError:
            raise
        except ee.EEException as e:
            raise GEEDataError(f"Earth Engine error querying Sentinel-2 collection: {str(e)}")
        except Exception as e:
            raise GEEDataError(f"Unexpected error querying Sentinel-2 collection: {str(e)}")

    def _compute_index(self, image: ee.Image, layer_id: str) -> ee.Image:
        """
        Computes the requested optical index.
        B2: Blue, B3: Green, B4: Red, B8: NIR, B11: SWIR1
        """
        if layer_id == "NDVI":
            return image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            
        elif layer_id == "EVI":
            # EVI = 2.5 * ((NIR - Red) / (NIR + 6 * Red - 7.5 * Blue + 1.0))
            return image.expression(
                '2.5 * ((NIR - RED) / (NIR + 6.0 * RED - 7.5 * BLUE + 1.0))', {
                    'NIR': image.select('B8'),
                    'RED': image.select('B4'),
                    'BLUE': image.select('B2')
                }).rename('EVI')
            
        elif layer_id == "SAVI":
            # SAVI = ((NIR - Red) / (NIR + Red + 0.5)) * 1.5
            return image.expression(
                '((NIR - RED) / (NIR + RED + 0.5)) * 1.5', {
                    'NIR': image.select('B8'),
                    'RED': image.select('B4')
                }).rename('SAVI')
            
        elif layer_id == "NDMI":
            return image.normalizedDifference(['B8', 'B11']).rename('NDMI')
            
        elif layer_id == "GNDVI":
            return image.normalizedDifference(['B8', 'B3']).rename('GNDVI')
            
        elif layer_id == "NDWI":
            # NDWI = (GREEN - NIR) / (GREEN + NIR)
            return image.normalizedDifference(['B3', 'B8']).rename('NDWI')
            
        elif layer_id == "CVI":
            # Legacy CVI uses weighted sum of 5 indices
            ndvi = image.normalizedDifference(['B8', 'B4'])
            evi = image.expression(
                '2.5 * ((NIR - RED) / (NIR + 6.0 * RED - 7.5 * BLUE + 1.0))', {
                    'NIR': image.select('B8'), 'RED': image.select('B4'), 'BLUE': image.select('B2')
                })
            savi = image.expression(
                '((NIR - RED) / (NIR + RED + 0.5)) * 1.5', {
                    'NIR': image.select('B8'), 'RED': image.select('B4')
                })
            ndmi = image.normalizedDifference(['B8', 'B11'])
            gndvi = image.normalizedDifference(['B8', 'B3'])
            
            cvi = (
                ndvi.multiply(0.70)
                .add(evi.multiply(0.10))
                .add(savi.multiply(0.05))
                .add(ndmi.multiply(0.10))
                .add(gndvi.multiply(0.05))
                .rename('CVI')
            )
            return cvi
            
        else:
            raise GEEDataError(f"Unsupported index {layer_id} in Sentinel2Provider")

    def get_image(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, cloud_pct: int = 20) -> ee.Image:
        collection = self._get_collection(boundary, start_date, end_date, cloud_pct)
        # We use median composite. We DO NOT clip here because clipping before focal_mean
        # causes the edges to have no neighbors, which shrinks the mask by the kernel radius.
        # This obliterates small polygons. We clip at the very end in get_tiles() instead.
        median_image = collection.median()
        index_image = self._compute_index(median_image, layer_id)
        # NOTE: Do NOT mask negative values here. Water, urban surfaces, and bare soil
        # all produce negative vegetation indices. Masking them removes these land-cover
        # classes from the visualization entirely and makes the output appear uniform.
        return index_image

    def get_tiles(self, layer_id: str, boundary: ee.Geometry, start_date: str, end_date: str, vis_params: Dict[str, Any], cloud_pct: int = 20) -> Dict[str, str]:
        try:
            image = self.get_image(layer_id, boundary, start_date, end_date, cloud_pct)
            
            # Use fixed visualization bounds from registry to ensure 
            # consistent EOS vegetation contrast. Adaptive percentiles 
            # cause the scale to squash when water (-1) is present.
            vis_params = dict(vis_params)

            # Replicate legacy structured smoothing
            if vis_params.get("smoothing", False):
                image = (image
                         .resample('bicubic')
                         .reproject(crs='EPSG:4326', scale=10)
                         .focal_mean(2, 'circle', 'pixels'))
            
            # Mask out invalid/negative values before visualization so they don't render black
            image = image.updateMask(image.gte(0))

            # Clip LAST, so the smoothed pixels don't bleed outside the boundary
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

    def get_pixel_value(self, layer_id: str, lat: float, lng: float, start_date: str, end_date: str, cloud_pct: int = 20, geometryId: str = None) -> Dict[str, Any]:
        """
        Sample the exact pixel value at the given coordinate.
        """
        try:
            # Create a point geometry
            point = ee.Geometry.Point([lng, lat])
            
            # For optimal Earth Engine caching, filter using the village boundary if provided
            # This shares the exact same computation graph with the tile generation request.
            boundary = point
            if geometryId:
                from app.services.village_service import get_village_boundary
                from app.services.gee.geometry import geojson_to_ee_geometry
                village_geojson = get_village_boundary(geometryId)
                if village_geojson:
                    boundary = geojson_to_ee_geometry(village_geojson)
            
            # Get the raw image
            image = self.get_image(layer_id, boundary, start_date, end_date, cloud_pct)
            
            # Clip the image to the exact polygon boundary to enforce strict spatial masking
            image = image.clip(boundary)
            
            # Sample the image at the point
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
