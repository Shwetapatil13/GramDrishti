from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Dict, Any
from app.models.recommendations import AIRecommendationModel
from app.services.scoring.risk_ranker import rank_risks
from app.api.routes.ai import _gather_context_data
from app.services.ai.ai_service import ai_service
from app.api.routes.scores import get_village_score

router = APIRouter()


@router.get("/recommendations/{village_id}",
            response_model=List[AIRecommendationModel])
async def get_village_recommendations(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    """
    Fetch AI recommendations via the AI service, but return parsed and validated models.
    """
    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        raw_recs = await ai_service.get_recommendations(village, metrics, score)

        # Validate against the Pydantic model
        validated_recs = [AIRecommendationModel(**rec) for rec in raw_recs]

        # Ensure exactly 3 are returned
        if len(validated_recs) != 3:
            raise ValueError(
                f"Expected 3 recommendations, got {
                    len(validated_recs)}")

        return validated_recs
    except Exception as e:
        import traceback
        with open("error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


class DynamicRecRequest(BaseModel):
    village_id: str
    polygon: Dict[str, Any]
    year: int = 2024


@router.post("/recommendations/analyze",
             response_model=List[AIRecommendationModel])
async def get_dynamic_recommendations(req: DynamicRecRequest):
    try:
        from app.services.gee.processor import get_all_gee_metrics
        from app.services.scoring.aggregator import aggregate_environmental_metrics
        from app.services.scoring.health_score import calculate_overall_score, calculate_water_score, calculate_vegetation_score, calculate_climate_score, calculate_flood_score, calculate_land_score
        from app.services.village_service import add_dynamic_village

        village = add_dynamic_village(req.village_id, req.polygon)

        raw_metrics = await get_all_gee_metrics(req.village_id, req.polygon, req.year)
        metrics = aggregate_environmental_metrics(
            req.village_id, req.year, raw_metrics)

        components = {
            "water": calculate_water_score(metrics),
            "vegetation": calculate_vegetation_score(metrics),
            "climate": calculate_climate_score(metrics),
            "flood": calculate_flood_score(metrics),
            "land": calculate_land_score(metrics)
        }
        score = calculate_overall_score(components)
        score.villageId = req.village_id
        score.year = req.year

        raw_recs = await ai_service.get_recommendations(village, metrics, score)
        
        for rec in raw_recs:
            if 'urgency' in rec and isinstance(rec['urgency'], str):
                rec['urgency'] = rec['urgency'].lower()
                
        validated_recs = [AIRecommendationModel(**rec) for rec in raw_recs]

        if len(validated_recs) != 3:
            raise ValueError(
                f"Expected 3 recommendations, got {
                    len(validated_recs)}")

        return validated_recs
    except Exception as e:
        import traceback
        with open("error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{village_id}/risks")
async def get_village_risks(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    try:
        score = await get_village_score(village_id=village_id, year=year)
        risks = rank_risks(score)
        return risks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
