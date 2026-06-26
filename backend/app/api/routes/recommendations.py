from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Dict, Any
from app.models.recommendations import AIRecommendationModel
from app.services.scoring.risk_ranker import rank_risks
from app.api.routes.ai import _gather_context_data
from app.services.ai.ai_service import ai_service
from app.api.routes.scores import get_village_score

router = APIRouter()

@router.get("/recommendations/{village_id}", response_model=List[AIRecommendationModel])
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
            raise ValueError(f"Expected 3 recommendations, got {len(validated_recs)}")
            
        return validated_recs
    except Exception as e:
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