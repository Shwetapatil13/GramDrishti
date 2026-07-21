from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.ai.ai_service import ai_service
from app.services.village_service import get_village_by_id
from app.api.routes.satellite import get_village_metrics
from app.api.routes.scores import get_village_score
from app.utils.cache import cache
import time


router = APIRouter()


class ChatMessage(BaseModel):
    id: str
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str
    language: str = "en"
    history: List[ChatMessage] = []
    mapState: Dict[str, Any] = {}
    clickedLocation: Dict[str, Any] | None = None


def check_rate_limit(request: Request):
    """
    Simple manual rate limiting: 10 requests per minute per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = int(time.time() // 60)  # current minute
    key = f"rl_{client_ip}_{current_time}"

    val = cache.get(key)
    count = val.get("count", 0) if val else 0

    if count >= 10:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again in a minute.")

    cache.set(key, {"count": count + 1}, ttl_seconds=60)


import asyncio

async def _gather_context_data(village_id: str, year: int):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    metrics, score = await asyncio.gather(
        get_village_metrics(village_id, year),
        get_village_score(village_id, year)
    )
    return village, metrics, score


# We removed _gather_rag_context since it is now handled by RetrievalEngine in ai_service


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
        return {"summary": cached.get("summary", cached.get("text", "")), "ai_source": cached.get("ai_source", "gemini")}

    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        res = await ai_service.get_summary(village, metrics, score, language=language)
        if isinstance(res, dict):
            summary_dict = res
        else:
            summary_dict = {"summary": res, "ai_source": "gemini"}
        cache.set(cache_key, summary_dict, ttl_seconds=86400)
        return summary_dict
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
        return {"recommendations": cached.get("recommendations", cached.get("recs", [])), "ai_source": cached.get("ai_source", "gemini")}

    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        res = await ai_service.get_recommendations(village, metrics, score, language=language)
        if isinstance(res, dict):
            recs_dict = res
        else:
            recs_dict = {"recommendations": res, "ai_source": "gemini"}
        cache.set(cache_key, recs_dict, ttl_seconds=86400)
        return recs_dict
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
        # Convert Pydantic models in history to dicts if needed
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in body.history] if body.history else []
        
        return StreamingResponse(
            ai_service.chat_stream(
                question=body.question,
                village_id=village_id,
                year=year,
                language=body.language,
                history=history_dicts,
                map_state=body.mapState,
                clicked_location=body.clickedLocation
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
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
        return {"narrative": cached.get("narrative", cached.get("text", "")), "ai_source": cached.get("ai_source", "gemini")}

    try:
        village, metrics, score = await _gather_context_data(village_id, year)
        res = await ai_service.get_report_narrative(village, metrics, score, language=language)
        if isinstance(res, dict):
            narrative_dict = res
        else:
            narrative_dict = {"narrative": res, "ai_source": "gemini"}
        cache.set(cache_key, narrative_dict, ttl_seconds=86400)
        return narrative_dict
    except Exception as e:
        raise HTTPException(status_code=504, detail=str(e))
