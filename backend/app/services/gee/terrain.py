"""
SRTM DEM (USGS/SRTMGL1_003) terrain analysis.
Year-independent — terrain doesn't change.
"""
import ee
from app.services.gee.geometry import geojson_to_ee_geometry
from app.core.exceptions import GEEDataError


def get_terrain_metrics(boundary: dict) -> dict[str, float]:
    """
    Returns:
        mean_elevation_m: float
        slope_mean_degrees: float
        slope_std_degrees: float
        flood_risk_area_percent: float  # % of area with slope < 2°
    """
    try:
        geom = geojson_to_ee_geometry(boundary)

        # Get SRTM DEM
        dem = ee.Image('USGS/SRTMGL1_003').clip(geom)

        # Calculate slope
        slope = ee.Terrain.slope(dem)

        # Calculate flood risk area (slope < 2 degrees)
        flat_area = slope.lt(ee.Number(2))

        # Combine bands
        terrain_bands = dem.rename('elevation').addBands(slope.rename('slope'))

        # Reduce to get mean elevation and slope
        stats = terrain_bands.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.stdDev(),
                sharedInputs=True
            ),
            geometry=geom,
            scale=30,
            maxPixels=int(1e9)
        ).getInfo() or {}

        # Calculate area percentage for slope < 2
        flat_area_stats = flat_area.multiply(
            ee.Image.pixelArea()).reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=geom,
            scale=30,
            maxPixels=int(1e9)).getInfo() or {}

        total_area_stats = ee.Image.pixelArea().reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=geom,
            scale=30,
            maxPixels=int(1e9)
        ).getInfo() or {}

        flat_area_val = float(flat_area_stats.get('slope') or 0.0)
        total_area_val = float(total_area_stats.get(
            'area') or 1.0)  # avoid div by zero

        flood_risk_percent = (flat_area_val / total_area_val) * \
            100.0 if total_area_val > 0 else 0.0

        def safe_float(val):
            return float(val) if val is not None else 0.0

        return {
            "mean_elevation_m": safe_float(stats.get('elevation_mean')),
            "slope_mean_degrees": safe_float(stats.get('slope_mean')),
            "slope_std_degrees": safe_float(stats.get('slope_stdDev')),
            "flood_risk_area_percent": flood_risk_percent
        }

    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error processing Terrain: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error processing Terrain metrics: {str(e)}")
