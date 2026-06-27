from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.ai.ai_service import ai_service
from app.services.village_service import get_village_by_id
from app.api.routes.satellite import get_village_metrics
from app.api.routes.scores import get_village_score
from app.utils.cache import cache
import time

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    language: str = "en"

def check_rate_limit(request: Request):
    """
    Simple manual rate limiting: 10 requests per minute per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = int(time.time() // 60) # current minute
    key = f"rl_{client_ip}_{current_time}"
    
    val = cache.get(key)
    count = val.get("count", 0) if val else 0
    
    if count >= 10:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")
        
    cache.set(key, {"count": count + 1}, ttl_seconds=60)

async def _gather_context_data(village_id: str, year: int):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
        
    metrics = await get_village_metrics(village_id, year)
    score = await get_village_score(village_id, year)
    
    return village, metrics, score

@router.post("/ai/{village_id}/summary")
async def get_ai_summary(
    request: Request,
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026),
    language: str = Query("en")
):
    check_rate_limit(request)
    
    cache_key = cache.build_key(village_id, year, "ai_summary", language)
    cached = cache.get(cache_key)
    if cached:
        return {"summary": cached["text"]}
        
    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        summary = await ai_service.get_summary(village, metrics, score, language=language)
        cache.set(cache_key, {"text": summary}, ttl_seconds=86400)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=504, detail=str(e))

@router.post("/ai/{village_id}/recommendations")
async def get_ai_recommendations(
    request: Request,
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026),
    language: str = Query("en")
):
    check_rate_limit(request)
    
    cache_key = cache.build_key(village_id, year, "ai_recs", language)
    cached = cache.get(cache_key)
    if cached:
        return {"recommendations": cached["recs"]}
        
    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        recs = await ai_service.get_recommendations(village, metrics, score, language=language)
        cache.set(cache_key, {"recs": recs}, ttl_seconds=86400)
        return {"recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=504, detail=str(e))

@router.post("/ai/{village_id}/chat")
async def chat_with_ai(
    request: Request,
    village_id: str,
    body: ChatRequest,
    year: int = Query(2024, ge=2022, le=2026)
):
    check_rate_limit(request)
    
    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        answer = await ai_service.chat(body.question, village, metrics, score, language=body.language)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=504, detail=str(e))

@router.get("/ai/{village_id}/report-narrative")
async def get_report_narrative(
    request: Request,
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026),
    language: str = Query("en")
):
    check_rate_limit(request)
    
    cache_key = cache.build_key(village_id, year, "ai_narrative", language)
    cached = cache.get(cache_key)
    if cached:
        return {"narrative": cached["text"]}
        
    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        narrative = await ai_service.get_report_narrative(village, metrics, score, language=language)
        cache.set(cache_key, {"text": narrative}, ttl_seconds=86400)
        return {"narrative": narrative}
    except Exception as e:
        raise HTTPException(status_code=504, detail=str(e))