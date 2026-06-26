"""
Aggregator to merge raw GEE metrics into EnvironmentalMetrics object.
"""
from typing import Dict, Any, Optional
from app.models.village import EnvironmentalMetrics, LandCoverBreakdown
from app.services.scoring.environmental import calculate_green_cover
from app.core.logging import get_logger

logger = get_logger(__name__)

def aggregate_environmental_metrics(village_id: str, year: int, raw_metrics: Dict[str, Any]) -> EnvironmentalMetrics:
    """
    Merges Sentinel-2 + Dynamic World + Terrain + Water into EnvironmentalMetrics.
    Validates limits and handles partial failures.
    """
    
    sentinel = raw_metrics.get("sentinel") or {}
    water = raw_metrics.get("water") or {}
    lc = raw_metrics.get("land_cover") or {}
    
    # Basic fallbacks (to 0.0) if missing
    ndvi = float(sentinel.get("ndvi_mean", 0.0))
    ndwi = float(sentinel.get("ndwi_mean", 0.0))
    water_area = float(water.get("water_area_ha", 0.0))
    
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
    
    # Construct complete metric
    return EnvironmentalMetrics(
        villageId=village_id,
        year=year,
        ndvi=ndvi,
        ndwi=ndwi,
        waterAreaHa=water_area,
        greenCoverPercent=green_cover_percent,
        landCover=land_cover_breakdown,
        temperature=0.0, # Filled in Level 5
        rainfall=0.0,
        humidity=0.0,
        windSpeed=0.0,
        dataSource=data_source
    )