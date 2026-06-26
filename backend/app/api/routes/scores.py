from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.gee.processor import get_all_gee_metrics
from app.services.scoring.aggregator import aggregate_environmental_metrics
from app.services.village_service import get_village_boundary
from app.services.scoring.health_score import (
    calculate_water_score,
    calculate_vegetation_score,
    calculate_climate_score,
    calculate_flood_score,
    calculate_land_score,
    calculate_overall_score
)
from app.models.village import VillageHealthScore
from app.utils.cache import cache

router = APIRouter()

async def get_raw_score_for_year(village_id: str, year: int) -> Optional[VillageHealthScore]:
    boundary = get_village_boundary(village_id)
    if not boundary:
        return None
        
    try:
        raw_metrics = await get_all_gee_metrics(village_id, boundary, year)
        metrics = aggregate_environmental_metrics(village_id, year, raw_metrics)
        
        # We don't calculate trends relative to previous year inside this helper
        components = {
            "water": calculate_water_score(metrics),
            "vegetation": calculate_vegetation_score(metrics),
            "climate": calculate_climate_score(metrics),
            "flood": calculate_flood_score(metrics),
            "land": calculate_land_score(metrics)
        }
        
        score = calculate_overall_score(components)
        score.villageId = village_id
        score.year = year
        return score
    except Exception:
        return None

@router.get("/scores/{village_id}", response_model=VillageHealthScore)
async def get_village_score(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
        
    cache_key = cache.build_key(village_id, year, "score")
    cached = cache.get(cache_key)
    if cached:
        return cached
        
    try:
        raw_metrics = await get_all_gee_metrics(village_id, boundary, year)
        metrics = aggregate_environmental_metrics(village_id, year, raw_metrics)
        
        # Attempt to get previous year for trend calculation
        prev_score = None
        if year > 2022:
            prev_score = await get_raw_score_for_year(village_id, year - 1)
            
        prev_overall = prev_score.overall if prev_score else None
        
        components = {
            "water": calculate_water_score(metrics, prev_score.water.score if prev_score else None),
            "vegetation": calculate_vegetation_score(metrics, prev_score.vegetation.score if prev_score else None),
            "climate": calculate_climate_score(metrics, prev_score.climate.score if prev_score else None),
            "flood": calculate_flood_score(metrics, prev_score.flood.score if prev_score else None),
            "land": calculate_land_score(metrics, prev_score.land.score if prev_score else None)
        }
        
        score = calculate_overall_score(components, prev_overall)
        score.villageId = village_id
        score.year = year
        
        # Since score object doesn't have trend string at root, we assume frontend handles root trend via TrendBadge logic
        cache.set(cache_key, score.model_dump(), ttl_seconds=86400)
        return score
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scores/{village_id}/component/{component}")
async def get_village_component_score(
    village_id: str,
    component: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    score = await get_village_score(village_id, year)
    if not hasattr(score, component):
        raise HTTPException(status_code=400, detail="Invalid component")
    return getattr(score, component)

@router.get("/scores/{village_id}/trend")
async def get_village_score_trend(
    village_id: str,
    years: str = Query("2022,2023,2024")
):
    year_list = [int(y) for y in years.split(",")]
    results = []
    
    for year in year_list:
        score = await get_village_score(village_id, year)
        results.append(score)
        
    return results