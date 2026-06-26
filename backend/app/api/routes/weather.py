from fastapi import APIRouter, HTTPException, Query
from app.services.weather.openmeteo import get_current_weather, get_historical_annual
from app.services.weather.analysis import assess_rainfall_adequacy, assess_heat_stress, assess_drought_risk
from app.services.village_service import get_village_by_id
from app.utils.cache import cache
import httpx

router = APIRouter()

@router.get("/weather/{village_id}/current")
async def get_village_current_weather(village_id: str):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
        
    cache_key = cache.build_key(village_id, 0, "current_weather")
    cached = cache.get(cache_key)
    if cached:
        return cached

    lat, lon = village.coordinates
    try:
        data = await get_current_weather(lat, lon)
        cache.set(cache_key, data, ttl_seconds=600) # 10 mins cache
        return data
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather/{village_id}/historical")
async def get_village_historical_weather(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
        
    cache_key = cache.build_key(village_id, year, "historical_weather")
    cached = cache.get(cache_key)
    if cached:
        return cached

    lat, lon = village.coordinates
    try:
        data = await get_historical_annual(lat, lon, year)
        cache.set(cache_key, data, ttl_seconds=86400) # 24 hrs cache
        return data
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather/{village_id}/assessment")
async def get_weather_assessment(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
        
    try:
        # We need historical data to assess the year
        # and current data for heat stress if it's the current year. 
        # We'll use historical data for rainfall, and mock current conditions for heat stress based on historical max temp.
        lat, lon = village.coordinates
        hist = await get_historical_annual(lat, lon, year)
        
        # Assume a standard summer humidity of 50% for heat stress demo purposes, using max_temp_c
        heat_stress = assess_heat_stress(hist["max_temp_c"], 50.0)
        rainfall_adequacy = assess_rainfall_adequacy(hist["annual_rainfall_mm"], village.district)
        
        # We need NDVI to assess drought risk correctly. For now we use a mocked 0.4.
        # This endpoint is mostly a helper, full assessment happens in the analysis/aggregator.
        drought_risk = assess_drought_risk(hist["annual_rainfall_mm"], 0.4, village.district)
        
        return {
            "heat_stress": heat_stress,
            "rainfall_adequacy": rainfall_adequacy,
            "drought_risk": drought_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))