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

        # Calculate flood risk fraction (slope < 2 degrees)
        flat_mask = slope.lt(ee.Number(2)).rename('flat_fraction')

        # Combine bands into a single image
        terrain_img = dem.rename('elevation').addBands(slope.rename('slope')).addBands(flat_mask)

        # Reduce in a single round-trip
        stats = terrain_img.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.stdDev(),
                sharedInputs=True
            ),
            geometry=geom,
            scale=30,
            maxPixels=int(1e9),
            bestEffort=True
        ).getInfo() or {}

        def safe_float(val):
            return float(val) if val is not None else 0.0

        return {
            "mean_elevation_m": safe_float(stats.get('elevation_mean')),
            "slope_mean_degrees": safe_float(stats.get('slope_mean')),
            "slope_std_degrees": safe_float(stats.get('slope_stdDev')),
            "flood_risk_area_percent": safe_float(stats.get('flat_fraction_mean')) * 100.0
        }

    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error processing Terrain: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error processing Terrain metrics: {str(e)}")
