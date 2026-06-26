from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import asyncio
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
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

async def _compute_score(village_id: str, boundary: dict, year: int) -> Optional[VillageHealthScore]:
    """Compute health score for a single year. Returns None on any failure."""
    try:
        logger.info(f"[Scores] Computing score for {village_id}/{year}...")
        raw_metrics = await get_all_gee_metrics(village_id, boundary, year)
        metrics = aggregate_environmental_metrics(village_id, year, raw_metrics)
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
        logger.info(f"[Scores] ✅ Score for {village_id}/{year}: overall={score.overall:.1f}")
        return score
    except Exception as e:
        logger.error(f"[Scores] ❌ Failed to compute score for {village_id}/{year}: {e}")
        return None

# Keep old name for backward compatibility with other routes that import it
async def get_raw_score_for_year(village_id: str, year: int) -> Optional[VillageHealthScore]:
    boundary = get_village_boundary(village_id)
    if not boundary:
        return None
    return await _compute_score(village_id, boundary, year)

@router.get("/scores/{village_id}", response_model=VillageHealthScore)
async def get_village_score(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail=f"Village '{village_id}' not found in index")

    cache_key = cache.build_key(village_id, year, "score")
    cached = cache.get(cache_key)
    if cached:
        logger.info(f"[Scores] Cache HIT for {cache_key}")
        return cached

    logger.info(f"[Scores] Cache MISS for {cache_key}. Running GEE pipeline (current + prev year concurrently)...")

    try:
        # Run current year and previous year GEE calls CONCURRENTLY (not sequentially)
        # Hard outer timeout of 90s to prevent indefinite hanging in the dashboard
        current_task = _compute_score(village_id, boundary, year)
        prev_task = _compute_score(village_id, boundary, year - 1) if year > 2022 else asyncio.sleep(0, result=None)

        current_score, prev_score = await asyncio.wait_for(
            asyncio.gather(current_task, prev_task, return_exceptions=False),
            timeout=90.0
        )

        if not current_score:
            raise HTTPException(status_code=500, detail=f"GEE analysis failed for village '{village_id}' year {year}. Check backend logs.")

        # Re-compute with trend data now that we have both years
        prev_overall = prev_score.overall if prev_score else None
        raw_metrics = await get_all_gee_metrics(village_id, boundary, year)
        metrics = aggregate_environmental_metrics(village_id, year, raw_metrics)

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

        cache.set(cache_key, score.model_dump(), ttl_seconds=86400)
        logger.info(f"[Scores] ✅ Score cached for {cache_key}")
        return score

    except asyncio.TimeoutError:
        logger.error(f"[Scores] ❌ Outer 90s timeout hit for {village_id}/{year}")
        raise HTTPException(status_code=504, detail=f"GEE analysis timed out for village '{village_id}'. Earth Engine is slow — try again in 30 seconds.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Scores] ❌ Unexpected error for {village_id}/{year}: {e}", exc_info=True)
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