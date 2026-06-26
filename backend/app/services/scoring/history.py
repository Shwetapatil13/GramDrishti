"""
Historical data fetching and change statistics calculations.
"""
import asyncio
from typing import List, Dict, Any
from app.models.village import HistoricalData, EnvironmentalMetrics, VillageHealthScore
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
from app.core.exceptions import VillageNotFoundError

async def get_historical_data(village_id: str, years: List[int]) -> HistoricalData:
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise VillageNotFoundError(f"Village {village_id} not found")

    metrics_list: List[EnvironmentalMetrics] = []
    scores_list: List[VillageHealthScore] = []
    
    # Sort years to ensure correct chronological order
    sorted_years = sorted(years)
    
    # We can fetch GEE metrics in parallel
    tasks = [get_all_gee_metrics(village_id, boundary, year) for year in sorted_years]
    raw_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    prev_score = None
    for i, year in enumerate(sorted_years):
        raw = raw_results[i]
        if isinstance(raw, Exception):
            # Skip or handle missing year gracefully
            continue
            
        metrics = aggregate_environmental_metrics(village_id, year, raw) # type: ignore
        metrics_list.append(metrics)
        
        # Calculate score
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
        scores_list.append(score)
        prev_score = score
        
    return HistoricalData(
        villageId=village_id,
        years=sorted_years,
        metrics=metrics_list,
        scores=scores_list
    )

def calculate_change_statistics(historical: HistoricalData) -> Dict[str, Any]:
    metrics = historical.metrics
    scores = historical.scores
    
    if len(metrics) < 2:
        return {} # Need at least 2 years to compare

    ndvi_changes = []
    water_area_changes = []
    green_cover_changes = []
    score_changes = []
    
    for i in range(len(metrics)):
        year = metrics[i].year
        ndvi = metrics[i].ndvi
        water = metrics[i].waterAreaHa
        green = metrics[i].greenCoverPercent
        overall = scores[i].overall
        
        ndvi_delta = 0.0
        water_delta = 0.0
        green_delta = 0.0
        score_delta = 0.0
        
        if i > 0:
            ndvi_delta = ndvi - metrics[i-1].ndvi
            water_delta = water - metrics[i-1].waterAreaHa
            green_delta = green - metrics[i-1].greenCoverPercent
            score_delta = overall - scores[i-1].overall
            
        ndvi_changes.append({"year": year, "value": ndvi, "delta_from_previous": ndvi_delta})
        water_area_changes.append({"year": year, "value_ha": water, "delta_ha": water_delta})
        green_cover_changes.append({"year": year, "value_percent": green, "delta_percent": green_delta})
        score_changes.append({"year": year, "overall": overall, "delta": score_delta})

    best_year = max(scores, key=lambda s: s.overall).year
    worst_year = min(scores, key=lambda s: s.overall).year
    
    overall_delta = scores[-1].overall - scores[0].overall
    if overall_delta > 2:
        overall_trend = "improving"
    elif overall_delta < -2:
        overall_trend = "declining"
    else:
        overall_trend = "stable"
        
    # Find top 3 changes
    changes_pool: List[Dict[str, Any]] = []
    
    # Evaluate across the whole period (first year to last year)
    first_m = metrics[0]
    last_m = metrics[-1]
    
    ndvi_diff = last_m.ndvi - first_m.ndvi
    changes_pool.append({
        "type": "NDVI",
        "magnitude": abs(ndvi_diff * 100), # scale for sorting
        "direction": "improving" if ndvi_diff > 0 else "declining",
        "description": f"NDVI {'increased' if ndvi_diff > 0 else 'decreased'} by {abs(ndvi_diff):.2f} since {first_m.year}"
    })
    
    water_diff = last_m.waterAreaHa - first_m.waterAreaHa
    changes_pool.append({
        "type": "Water Area",
        "magnitude": abs(water_diff),
        "direction": "improving" if water_diff > 0 else "declining",
        "description": f"Surface water {'expanded' if water_diff > 0 else 'shrank'} by {abs(water_diff):.1f} ha since {first_m.year}"
    })
    
    green_diff = last_m.greenCoverPercent - first_m.greenCoverPercent
    changes_pool.append({
        "type": "Green Cover",
        "magnitude": abs(green_diff),
        "direction": "improving" if green_diff > 0 else "declining",
        "description": f"Green cover {'expanded' if green_diff > 0 else 'shrank'} by {abs(green_diff):.1f}% since {first_m.year}"
    })
    
    # Sort by magnitude
    changes_pool.sort(key=lambda x: float(x["magnitude"]), reverse=True)
    top_changes = changes_pool[:3]
    
    return {
        "ndvi_changes": ndvi_changes,
        "water_area_changes": water_area_changes,
        "green_cover_changes": green_cover_changes,
        "score_changes": score_changes,
        "best_year": best_year,
        "worst_year": worst_year,
        "overall_trend": overall_trend,
        "top_changes": top_changes
    }