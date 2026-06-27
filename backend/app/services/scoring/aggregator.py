"""
Aggregator to merge raw GEE metrics into EnvironmentalMetrics object.
"""
from typing import Dict, Any, Optional
from app.models.village import EnvironmentalMetrics, LandCoverBreakdown
from app.services.scoring.environmental import calculate_green_cover
from app.core.logging import get_logger

logger = get_logger(__name__)


def aggregate_environmental_metrics(
        village_id: str, year: int, raw_metrics: Dict[str, Any]) -> EnvironmentalMetrics:
    """
    Merges Sentinel-2 + Dynamic World + Terrain + Water into EnvironmentalMetrics.
    Validates limits and handles partial failures.
    """

    sentinel = raw_metrics.get("sentinel") or {}
    water = raw_metrics.get("water") or {}
    lc = raw_metrics.get("land_cover") or {}

    # Basic fallbacks (to 0.0) if missing
    ndvi = float(sentinel.get("ndvi_mean", raw_metrics.get("ndvi", 0.0)))
    ndwi = float(sentinel.get("ndwi_mean", raw_metrics.get("ndwi", 0.0)))
    water_area = float(
        water.get(
            "water_area_ha",
            raw_metrics.get(
                "water_area_ha",
                0.0)))

    # Clean limits
    ndvi = max(-1.0, min(1.0, ndvi))
    ndwi = max(-1.0, min(1.0, ndwi))
    water_area = max(0.0, water_area)

    # Map Land cover
    def safe_lc(key: str) -> float:
        val = lc.get(key, 0.0)
        return float(val) if val is not None else 0.0

    land_cover_breakdown = LandCoverBreakdown(
        cropland=max(0.0, min(100.0, safe_lc("crops") + safe_lc("cropland"))),
        trees=max(0.0, min(100.0, safe_lc("trees"))),
        water=max(0.0, min(100.0, safe_lc("water"))),
        builtArea=max(0.0, min(100.0, safe_lc("built") + safe_lc("builtArea"))),
        grassland=max(0.0, min(100.0, safe_lc("grass") + safe_lc("grassland"))),
        bareLand=max(0.0, min(100.0, safe_lc("bare") + safe_lc("bareLand"))),
        flooded=max(0.0, min(100.0, safe_lc("flooded_vegetation") + safe_lc("flooded")))
    )

    # Calculate green cover
    green_cover_percent = calculate_green_cover({
        "trees": land_cover_breakdown.trees,
        "grass": land_cover_breakdown.grassland,
        "crops": land_cover_breakdown.cropland,
        "shrub_and_scrub": safe_lc("shrub_and_scrub")
    })

    # Incomplete markers
    data_source = raw_metrics.get("dataSource", "live")
    if not sentinel or not lc or not water:
        if data_source == "live":
            data_source = "incomplete"

    weather = raw_metrics.get("weather") or {}

    # Construct complete metric
    return EnvironmentalMetrics(
        villageId=village_id,
        year=year,
        ndvi=ndvi,
        ndwi=ndwi,
        waterAreaHa=water_area,
        greenCoverPercent=green_cover_percent,
        landCover=land_cover_breakdown,
        temperature=float(weather.get("mean_temp_c", 0.0)),
        rainfall=float(weather.get("annual_rainfall_mm", 0.0)),
        # Mocked/Default if historical doesn't have it
        humidity=float(weather.get("humidity_percent", 50.0)),
        windSpeed=float(weather.get("wind_speed_kmh", 10.0)),  # Mocked/Default
        dataSource=data_source
    )
