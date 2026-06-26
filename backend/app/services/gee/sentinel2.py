"""
Sentinel-2 Surface Reflectance (COPERNICUS/S2_SR_HARMONIZED) retrieval.
Provides NDVI, NDWI, and band statistics for a village boundary.
"""
import ee
from app.services.gee.geometry import geojson_to_ee_geometry
from app.core.logging import get_logger
from app.core.exceptions import GEEDataError

logger = get_logger(__name__)

def get_sentinel2_metrics(boundary: dict, year: int, cloud_cover_max: int = 20) -> dict[str, float]:
    """
    Retrieve cloud-free Sentinel-2 median composite for a village boundary.

    NDVI = (B8 - B4) / (B8 + B4)
    NDWI = (B3 - B8) / (B3 + B8)

    Args:
        boundary: GeoJSON Polygon dict
        year: Target year (2022-2026)
        cloud_cover_max: Maximum cloud cover percentage filter

    Returns:
        {"ndvi_mean": float, "ndwi_mean": float, "red_mean": float,
         "nir_mean": float, "swir_mean": float}

    Raises:
        GEEDataError: If no imagery available for region/year
    """
    try:
        geom = geojson_to_ee_geometry(boundary)
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        # Sentinel-2 dataset
        collection = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                      .filterBounds(geom)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloud_cover_max)))

        if collection.size().getInfo() == 0:
            raise GEEDataError(f"No Sentinel-2 imagery found for {year} under {cloud_cover_max}% cloud cover")

        # Create median composite
        image = collection.median().clip(geom)

        # Calculate NDVI and NDWI
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')

        # Combine bands for reduction
        bands_to_reduce = image.select(['B4', 'B8', 'B11']).addBands([ndvi, ndwi])

        # Reduce region
        stats = bands_to_reduce.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geom,
            scale=10,
            maxPixels=1e9
        ).getInfo()

        # Handle potential nulls
        def safe_float(val):
            return float(val) if val is not None else 0.0

        return {
            "ndvi_mean": safe_float(stats.get('NDVI')),
            "ndwi_mean": safe_float(stats.get('NDWI')),
            "red_mean": safe_float(stats.get('B4')),
            "nir_mean": safe_float(stats.get('B8')),
            "swir_mean": safe_float(stats.get('B11'))
        }

    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error processing Sentinel-2: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error processing Sentinel-2 metrics: {str(e)}")

def get_ndvi_tiles(boundary: dict, year: int) -> dict[str, str]:
    """
    Generates a Google Earth Engine MapID (tile URL) for Sentinel-2 NDVI.
    """
    try:
        geom = geojson_to_ee_geometry(boundary)
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        collection = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                      .filterBounds(geom)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))

        if collection.size().getInfo() == 0:
            raise GEEDataError(f"No Sentinel-2 imagery found for {year}")

        image = collection.median().clip(geom)
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        vis_params = {
            'min': 0.0,
            'max': 0.8,
            'palette': [
                '#EF4444', # red (poor)
                '#F59E0B', # orange/yellow (fair)
                '#10B981', # light green (good)
                '#059669'  # dark green (excellent)
            ]
        }

        map_id_dict = ee.Image(ndvi).getMapId(vis_params)
        
        return {
            "urlFormat": map_id_dict['tile_fetcher'].url_format
        }

    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error generating NDVI tiles: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error generating NDVI tiles: {str(e)}")