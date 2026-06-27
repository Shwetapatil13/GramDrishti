from fastapi import APIRouter, HTTPException, Query, Body
from app.services.gee.processor import get_all_gee_metrics
from app.services.village_service import get_village_boundary
from app.services.scoring.aggregator import aggregate_environmental_metrics
from app.services.scoring.environmental import interpret_ndvi, interpret_water_stress, assess_flood_risk
from app.core.exceptions import GEETimeoutError, GEEDataError
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()


class AnalyzeRequest(BaseModel):
    village_id: str
    polygon: Dict[str, Any]
    year: int = 2024


@router.post("/analyze")
async def analyze_area(request: AnalyzeRequest):
    try:
        from app.services.village_service import add_dynamic_village
        add_dynamic_village(request.village_id, request.polygon)

        raw_metrics = await get_all_gee_metrics(request.village_id, request.polygon, request.year)
        metrics = aggregate_environmental_metrics(
            request.village_id, request.year, raw_metrics)

        # Mock area for now
        village_area_km2 = 50.0

        ndvi_analysis = interpret_ndvi(metrics.ndvi)
        water_analysis = interpret_water_stress(
            metrics.ndwi, metrics.waterAreaHa, village_area_km2)

        terrain_raw = raw_metrics.get("terrain") or {}
        lc_raw = raw_metrics.get("land_cover") or {}
        flood_analysis = assess_flood_risk(
            terrain_raw, lc_raw, metrics.rainfall)

        return {
            "villageId": request.village_id,
            "year": request.year,
            "metrics": metrics,
            "interpretations": {
                "vegetation": ndvi_analysis,
                "water": water_analysis,
                "flood": flood_analysis
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{village_id}/environmental")
async def get_environmental_analysis(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")

    try:
        raw_metrics = await get_all_gee_metrics(village_id, boundary, year)
        metrics = aggregate_environmental_metrics(
            village_id, year, raw_metrics)

        # We need the area of the village in km2
        # Mock area for now - in production would compute from boundary
        # geometry
        village_area_km2 = 50.0

        # Interpretations
        ndvi_analysis = interpret_ndvi(metrics.ndvi)
        water_analysis = interpret_water_stress(
            metrics.ndwi, metrics.waterAreaHa, village_area_km2)

        terrain_raw = raw_metrics.get("terrain") or {}
        lc_raw = raw_metrics.get("land_cover") or {}
        flood_analysis = assess_flood_risk(
            terrain_raw, lc_raw, metrics.rainfall)

        return {
            "villageId": village_id,
            "year": year,
            "metrics": metrics,
            "interpretations": {
                "vegetation": ndvi_analysis,
                "water": water_analysis,
                "flood": flood_analysis
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{village_id}/summary")
async def get_analysis_summary(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    # Short summary version
    analysis = await get_environmental_analysis(village_id, year)
    return analysis
