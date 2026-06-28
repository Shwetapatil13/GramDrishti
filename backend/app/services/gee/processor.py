"""
Orchestrates all GEE data retrieval for a village+year.
Checks cache first. Handles retries and timeouts.
"""
import asyncio
import time
from typing import Any
from app.utils.cache import cache
from app.core.logging import get_logger
from app.core.config import settings
from app.core.exceptions import GEETimeoutError, GEEDataError

from app.services.gee.sentinel2 import get_sentinel2_metrics
from app.services.gee.dynamic_world import get_land_cover
from app.services.gee.terrain import get_terrain_metrics
from app.services.gee.water import get_water_metrics
from app.services.weather.openmeteo import get_historical_annual
from app.services.village_service import get_village_by_id

logger = get_logger(__name__)

MOCK_METRICS: dict[str, dict[int, dict]] = {
    "mulshi": {
        2022: {"ndvi": 0.61, "ndwi": 0.23, "water_area_ha": 156.2, "green_cover_percent": 52.1,
               "land_cover": {"trees": 28.1, "cropland": 24.0, "water": 4.2, "built": 3.1,
                              "grassland": 16.4, "bareLand": 5.8, "flooded": 0.4}},
        2023: {"ndvi": 0.57, "ndwi": 0.19, "water_area_ha": 143.8, "green_cover_percent": 49.3,
               "land_cover": {"trees": 26.4, "cropland": 22.9, "water": 3.8, "built": 3.4,
                              "grassland": 15.2, "bareLand": 7.1, "flooded": 0.3}},
        2024: {"ndvi": 0.52, "ndwi": 0.16, "water_area_ha": 131.4, "green_cover_percent": 46.8,
               "land_cover": {"trees": 24.8, "cropland": 22.0, "water": 3.5, "built": 3.7,
                              "grassland": 14.3, "bareLand": 8.6, "flooded": 0.3}},
        2025: {"ndvi": 0.49, "ndwi": 0.14, "water_area_ha": 124.1, "green_cover_percent": 44.2,
               "land_cover": {"trees": 23.1, "cropland": 21.1, "water": 3.3, "built": 4.0,
                              "grassland": 13.6, "bareLand": 9.8, "flooded": 0.2}},
        2026: {"ndvi": 0.48, "ndwi": 0.13, "water_area_ha": 118.7, "green_cover_percent": 43.1,
               "land_cover": {"trees": 22.4, "cropland": 20.7, "water": 3.2, "built": 4.2,
                              "grassland": 13.1, "bareLand": 10.4, "flooded": 0.2}},
    },
    "maval": {
        2022: {"ndvi": 0.55, "ndwi": 0.18, "water_area_ha": 89.3, "green_cover_percent": 44.2,
               "land_cover": {"trees": 22.1, "cropland": 22.1, "water": 2.4, "built": 4.2,
                              "grassland": 14.8, "bareLand": 6.2, "flooded": 0.2}},
        2023: {"ndvi": 0.56, "ndwi": 0.20, "water_area_ha": 92.1, "green_cover_percent": 45.8,
               "land_cover": {"trees": 23.0, "cropland": 22.8, "water": 2.5, "built": 4.1,
                              "grassland": 15.1, "bareLand": 5.9, "flooded": 0.2}},
        2024: {"ndvi": 0.58, "ndwi": 0.22, "water_area_ha": 95.6, "green_cover_percent": 47.3,
               "land_cover": {"trees": 24.1, "cropland": 23.2, "water": 2.6, "built": 4.0,
                              "grassland": 15.6, "bareLand": 5.5, "flooded": 0.2}},
        2025: {"ndvi": 0.60, "ndwi": 0.24, "water_area_ha": 98.2, "green_cover_percent": 49.1,
               "land_cover": {"trees": 25.2, "cropland": 23.9, "water": 2.7, "built": 3.9,
                              "grassland": 16.0, "bareLand": 5.1, "flooded": 0.2}},
        2026: {"ndvi": 0.62, "ndwi": 0.26, "water_area_ha": 102.4, "green_cover_percent": 51.0,
               "land_cover": {"trees": 26.4, "cropland": 24.6, "water": 2.8, "built": 3.8,
                              "grassland": 16.5, "bareLand": 4.8, "flooded": 0.1}},
    },
    "ambegaon": {
        2022: {"ndvi": 0.58, "ndwi": 0.20, "water_area_ha": 112.3, "green_cover_percent": 48.6,
               "land_cover": {"trees": 25.2, "cropland": 23.4, "water": 3.0, "built": 3.5,
                              "grassland": 15.4, "bareLand": 6.4, "flooded": 0.3}},
        2023: {"ndvi": 0.57, "ndwi": 0.19, "water_area_ha": 109.8, "green_cover_percent": 47.9,
               "land_cover": {"trees": 24.8, "cropland": 23.1, "water": 2.9, "built": 3.6,
                              "grassland": 15.2, "bareLand": 6.8, "flooded": 0.3}},
        2024: {"ndvi": 0.56, "ndwi": 0.18, "water_area_ha": 107.1, "green_cover_percent": 47.1,
               "land_cover": {"trees": 24.3, "cropland": 22.8, "water": 2.8, "built": 3.7,
                              "grassland": 14.9, "bareLand": 7.2, "flooded": 0.3}},
        2025: {"ndvi": 0.55, "ndwi": 0.17, "water_area_ha": 104.6, "green_cover_percent": 46.3,
               "land_cover": {"trees": 23.8, "cropland": 22.5, "water": 2.8, "built": 3.8,
                              "grassland": 14.7, "bareLand": 7.7, "flooded": 0.2}},
        2026: {"ndvi": 0.54, "ndwi": 0.16, "water_area_ha": 102.0, "green_cover_percent": 45.5,
               "land_cover": {"trees": 23.2, "cropland": 22.3, "water": 2.7, "built": 3.9,
                              "grassland": 14.4, "bareLand": 8.1, "flooded": 0.2}},
    },
    "khed": {
        2022: {"ndvi": 0.52, "ndwi": 0.15, "water_area_ha": 78.4, "green_cover_percent": 43.2,
               "land_cover": {"trees": 21.4, "cropland": 21.8, "water": 2.1, "built": 4.8,
                              "grassland": 14.2, "bareLand": 8.4, "flooded": 0.1}},
        2023: {"ndvi": 0.50, "ndwi": 0.13, "water_area_ha": 74.2, "green_cover_percent": 41.8,
               "land_cover": {"trees": 20.6, "cropland": 21.2, "water": 2.0, "built": 5.0,
                              "grassland": 13.8, "bareLand": 9.2, "flooded": 0.1}},
        2024: {"ndvi": 0.48, "ndwi": 0.11, "water_area_ha": 70.1, "green_cover_percent": 40.4,
               "land_cover": {"trees": 19.8, "cropland": 20.6, "water": 1.9, "built": 5.2,
                              "grassland": 13.4, "bareLand": 10.0, "flooded": 0.1}},
        2025: {"ndvi": 0.47, "ndwi": 0.10, "water_area_ha": 67.5, "green_cover_percent": 39.6,
               "land_cover": {"trees": 19.2, "cropland": 20.4, "water": 1.8, "built": 5.4,
                              "grassland": 13.0, "bareLand": 10.7, "flooded": 0.1}},
        2026: {"ndvi": 0.45, "ndwi": 0.09, "water_area_ha": 64.8, "green_cover_percent": 38.7,
               "land_cover": {"trees": 18.6, "cropland": 20.1, "water": 1.7, "built": 5.6,
                              "grassland": 12.7, "bareLand": 11.4, "flooded": 0.1}},
    },
    "junnar": {
        2022: {"ndvi": 0.59, "ndwi": 0.21, "water_area_ha": 134.7, "green_cover_percent": 50.2,
               "land_cover": {"trees": 26.8, "cropland": 23.4, "water": 3.6, "built": 3.2,
                              "grassland": 15.6, "bareLand": 5.8, "flooded": 0.4}},
        2023: {"ndvi": 0.60, "ndwi": 0.22, "water_area_ha": 137.2, "green_cover_percent": 51.0,
               "land_cover": {"trees": 27.2, "cropland": 23.8, "water": 3.7, "built": 3.1,
                              "grassland": 15.8, "bareLand": 5.6, "flooded": 0.4}},
        2024: {"ndvi": 0.61, "ndwi": 0.23, "water_area_ha": 139.8, "green_cover_percent": 51.8,
               "land_cover": {"trees": 27.6, "cropland": 24.2, "water": 3.8, "built": 3.0,
                              "grassland": 16.0, "bareLand": 5.3, "flooded": 0.4}},
        2025: {"ndvi": 0.62, "ndwi": 0.24, "water_area_ha": 142.1, "green_cover_percent": 52.6,
               "land_cover": {"trees": 28.0, "cropland": 24.6, "water": 3.8, "built": 2.9,
                              "grassland": 16.2, "bareLand": 5.0, "flooded": 0.4}},
        2026: {"ndvi": 0.63, "ndwi": 0.25, "water_area_ha": 144.5, "green_cover_percent": 53.4,
               "land_cover": {"trees": 28.4, "cropland": 25.0, "water": 3.9, "built": 2.8,
                              "grassland": 16.4, "bareLand": 4.7, "flooded": 0.4}},
    },
}


async def _call_with_retry(
        fn,
        *args,
        max_retries: int = 3,
        timeout: int = 120) -> dict:
    """
    Retry wrapper with exponential backoff: 2s, 4s, 8s.
    Raises GEETimeoutError after all retries exhausted or timeout reached.
    """
    delays = [2, 4, 8]

    for attempt in range(max_retries):
        try:
            # Run blocking GEE calls in a thread
            result = await asyncio.wait_for(
                asyncio.to_thread(fn, *args),
                timeout=timeout
            )
            return result
        except asyncio.TimeoutError:
            if attempt == max_retries - 1:
                raise GEETimeoutError(
                    f"GEE call timed out after {timeout} seconds")
            logger.warning(
                f"GEE call timed out, retrying in {
                    delays[attempt]}s...")
        except Exception as e:
            if attempt == max_retries - 1:
                raise GEEDataError(f"GEE call failed: {str(e)}")
            logger.warning(
                f"GEE call failed: {
                    str(e)}, retrying in {
                    delays[attempt]}s...")

        await asyncio.sleep(delays[attempt])

    raise GEEDataError("Maximum retries exhausted")


async def get_all_gee_metrics(
        village_id: str,
        boundary: dict,
        year: int) -> dict:
    """
    Retrieve all GEE metrics for a village and year.
    Cache key: {village_id}_{year}_all
    TTL: 86400 seconds (24 hours)
    Runs Sentinel, DynamicWorld, Water, Terrain in parallel where possible.
    Logs start time, end time, duration.
    Falls back to mock data if USE_MOCK_DATA=True.
    """
    cache_key = cache.build_key(village_id, year, "all")

    if settings.USE_MOCK_DATA:
        # Simulate slight delay to mimic network response
        await asyncio.sleep(0.5)

        # Use a fallback mock data if village is not in hardcoded MOCK_METRICS
        if village_id in MOCK_METRICS and year in MOCK_METRICS[village_id]:
            mock_data = MOCK_METRICS[village_id][year].copy()
        else:
            mock_data = {
                "ndvi": 0.55,
                "ndwi": 0.20,
                "water_area_ha": 100.0,
                "green_cover_percent": 50.0,
                "land_cover": {
                    "trees": 25.0,
                    "cropland": 25.0,
                    "water": 5.0,
                    "built": 5.0,
                    "grassland": 15.0,
                    "bareLand": 24.0,
                    "flooded": 1.0}}

        mock_data["dataSource"] = "mock"

        # Fetch real weather for mock mode to avoid hardcoding large weather
        # tables
        village = get_village_by_id(village_id)
        if village:
            lat, lon = village.coordinates
            try:
                weather = await get_historical_annual(lat, lon, year)
                mock_data["weather"] = weather
            except Exception as e:
                logger.error(f"Mock weather fetch failed: {str(e)}")
                mock_data["weather"] = {
                    "annual_rainfall_mm": 800.0,
                    "mean_temp_c": 28.0,
                    "max_temp_c": 38.0,
                    "dry_days_count": 250,
                    "humidity_percent": 50.0,
                    "wind_speed_kmh": 12.0}

        return mock_data

    cached = cache.get(cache_key)
    if cached:
        logger.info(f"Cache HIT for {cache_key}")
        cached["dataSource"] = "cached"
        return cached

    logger.info(f"Cache MISS for {cache_key}. Starting GEE retrieval...")
    start_time = time.time()

    village = get_village_by_id(village_id)
    lat, lon = village.coordinates if village else (20.5937, 78.9629)

    try:
        # Run independent GEE queries concurrently
        results = await asyncio.gather(
            _call_with_retry(get_sentinel2_metrics, boundary, year),
            _call_with_retry(get_land_cover, boundary, year),
            _call_with_retry(get_terrain_metrics, boundary),
            _call_with_retry(get_water_metrics, boundary, year),
            get_historical_annual(lat, lon, year),
            return_exceptions=True
        )

        sentinel_res, dw_res, terrain_res, water_res, weather_res = results

        # Construct final aggregated dictionary
        aggregated: dict[str, Any] = {
            "dataSource": "live"
        }

        # Handle partial failures gracefully
        if isinstance(sentinel_res, Exception):
            logger.error(f"Sentinel-2 failed: {sentinel_res}")
            aggregated["sentinel"] = None
        else:
            aggregated["sentinel"] = sentinel_res

        if isinstance(dw_res, Exception):
            logger.error(f"Dynamic World failed: {dw_res}")
            aggregated["land_cover"] = None
        else:
            aggregated["land_cover"] = dw_res

        if isinstance(terrain_res, Exception):
            logger.error(f"Terrain failed: {terrain_res}")
            aggregated["terrain"] = None
        else:
            aggregated["terrain"] = terrain_res

        if isinstance(water_res, Exception):
            logger.error(f"Water failed: {water_res}")
            aggregated["water"] = None
        else:
            aggregated["water"] = water_res

        if isinstance(weather_res, Exception):
            logger.error(f"Weather failed: {weather_res}")
            aggregated["weather"] = None
        else:
            aggregated["weather"] = weather_res

        # Calculate some direct metrics expected by the current mockup structure
        # (This will be fully refined in Level 4 Environmental Analysis Engine)
        if aggregated.get("sentinel"):
            aggregated["ndvi"] = aggregated["sentinel"]["ndvi_mean"]
            aggregated["ndwi"] = aggregated["sentinel"]["ndwi_mean"]

        if aggregated.get("water"):
            aggregated["water_area_ha"] = aggregated["water"]["water_area_ha"]

        if aggregated.get("land_cover"):
            # Simple sum for green cover
            lc = aggregated["land_cover"]
            aggregated["green_cover_percent"] = lc.get(
                "trees", 0) + lc.get("grass", 0) + lc.get("crops", 0) + lc.get("shrub_and_scrub", 0)

        duration = time.time() - start_time
        logger.info(
            f"GEE retrieval complete for {cache_key}. Duration: {
                duration:.2f}s")

        cache.set(cache_key, aggregated, ttl_seconds=86400)

        return aggregated

    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"GEE retrieval failed for {cache_key} after {
                duration:.2f}s: {
                str(e)}")
        raise

async def sample_point_metrics(lat: float, lon: float, year: int) -> dict:
    """
    Simulates fetching raster values at a specific lat/lon coordinate for the given year.
    In a real implementation, this would call ee.ImageCollection.reduceRegion 
    with ee.Geometry.Point(lon, lat).
    """
    logger.info(f"Sampling GEE Point Metrics at lat={lat}, lon={lon} for year {year}")
    
    # Simulate network delay for GEE
    await asyncio.sleep(0.3)
    
    # Return mock sampled pixel values
    return {
        "ndvi_pixel_value": 0.58,
        "ndwi_pixel_value": 0.12,
        "elevation_m": 620,
        "slope_deg": 4.5,
        "land_cover_class": "cropland",
        "soil_moisture_index": 0.42
    }
