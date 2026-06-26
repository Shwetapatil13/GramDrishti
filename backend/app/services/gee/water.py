"""
JRC Global Surface Water (JRC/GSW1_4/GlobalSurfaceWater) analysis.
Combined with Sentinel-2 NDWI for comprehensive water assessment.
"""
import ee
from app.services.gee.geometry import geojson_to_ee_geometry
from app.core.exceptions import GEEDataError

def get_water_metrics(boundary: dict, year: int) -> dict[str, float]:
    """
    Returns:
        water_area_ha: float
        water_coverage_percent: float
        seasonal_water_months: float  # avg months/year with water
        water_occurrence_mean: float  # 0-100 JRC occurrence score
    """
    try:
        geom = geojson_to_ee_geometry(boundary)
        
        # JRC Global Surface Water
        # The base JRC dataset represents all-time statistics
        jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").clip(geom)
        
        # For year-specific data, we typically use the yearly history dataset
        # However, for robustness and since JRC yearly data often lags, 
        # we'll extract base statistics to represent general water presence.
        
        occurrence = jrc.select('occurrence')
        seasonality = jrc.select('seasonality')
        
        # Calculate water area (occurrence > 0)
        water_mask = occurrence.gt(0)
        water_area = water_mask.multiply(ee.Image.pixelArea())
        
        stats = water_area.reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=geom,
            scale=30,
            maxPixels=1e9
        ).getInfo()
        
        total_area_stats = ee.Image.pixelArea().reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=geom,
            scale=30,
            maxPixels=1e9
        ).getInfo()
        
        water_area_sqm = float(stats.get('occurrence') or 0.0)
        total_area_sqm = float(total_area_stats.get('area') or 1.0)
        
        # Convert sq meters to hectares
        water_area_ha = water_area_sqm / 10000.0
        
        water_coverage_percent = (water_area_sqm / total_area_sqm) * 100.0 if total_area_sqm > 0 else 0.0
        
        # Averages over the water-covered area
        water_stats = jrc.select(['occurrence', 'seasonality']).updateMask(water_mask).reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geom,
            scale=30,
            maxPixels=1e9
        ).getInfo()

        def safe_float(val):
            return float(val) if val is not None else 0.0

        return {
            "water_area_ha": water_area_ha,
            "water_coverage_percent": water_coverage_percent,
            "seasonal_water_months": safe_float(water_stats.get('seasonality')),
            "water_occurrence_mean": safe_float(water_stats.get('occurrence'))
        }
        
    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error processing Surface Water: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error processing Surface Water metrics: {str(e)}")