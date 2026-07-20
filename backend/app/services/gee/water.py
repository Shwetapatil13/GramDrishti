import ee
from app.services.gee.geometry import geojson_to_ee_geometry, compute_polygon_area_sqm
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
        total_area_sqm = compute_polygon_area_sqm(boundary)

        # JRC Global Surface Water
        jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").clip(geom)
        occurrence = jrc.select('occurrence')
        seasonality = jrc.select('seasonality')

        water_mask = occurrence.gt(0)

        # Single combined image reduction
        water_area_img = water_mask.multiply(ee.Image.pixelArea()).rename('water_area_sqm')
        occ_img = occurrence.updateMask(water_mask).rename('occurrence')
        seas_img = seasonality.updateMask(water_mask).rename('seasonality')

        combined = water_area_img.addBands(occ_img).addBands(seas_img)

        # Reduce region in ONE round-trip
        reducer = ee.Reducer.sum().combine(ee.Reducer.mean().repeat(2), sharedInputs=False)

        stats = combined.reduceRegion(
            reducer=reducer,
            geometry=geom,
            scale=30,
            maxPixels=int(1e9),
            bestEffort=True
        ).getInfo() or {}

        water_area_sqm = float(stats.get('sum', 0.0) or 0.0)
        means = stats.get('mean', [0.0, 0.0]) or [0.0, 0.0]
        occurrence_mean = float(means[0]) if len(means) > 0 and means[0] is not None else 0.0
        seasonality_mean = float(means[1]) if len(means) > 1 and means[1] is not None else 0.0

        water_area_ha = water_area_sqm / 10000.0
        water_coverage_percent = (water_area_sqm / total_area_sqm) * 100.0 if total_area_sqm > 0 else 0.0

        return {
            "water_area_ha": water_area_ha,
            "water_coverage_percent": water_coverage_percent,
            "seasonal_water_months": seasonality_mean,
            "water_occurrence_mean": occurrence_mean
        }

    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error processing Surface Water: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error processing Surface Water metrics: {str(e)}")


def get_water_tiles(boundary: dict, year: int) -> dict[str, str]:
    """
    Generates a Google Earth Engine MapID (tile URL) for Surface Water.
    """
    try:
        geom = geojson_to_ee_geometry(boundary)

        jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").clip(geom)
        occurrence = jrc.select('occurrence')
        water_mask = occurrence.gt(0)

        water_image = occurrence.updateMask(water_mask)

        vis_params = {
            'min': 0,
            'max': 100,
            'palette': ['#93C5FD', '#3B82F6', '#1D4ED8']
        }

        map_id_dict = ee.Image(water_image).getMapId(vis_params)

        return {
            "urlFormat": map_id_dict['tile_fetcher'].url_format
        }

    except ee.EEException as e:
        raise GEEDataError(
            f"Earth Engine error generating water tiles: {
                str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error generating water tiles: {str(e)}")
