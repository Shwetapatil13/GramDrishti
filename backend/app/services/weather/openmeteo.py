"""
Open-Meteo API integration. Free, no API key.
Docs: https://open-meteo.com/en/docs
Uses httpx async client. All calls timeout at 30 seconds.
"""
import httpx
from app.core.config import settings

async def get_current_weather(lat: float, lon: float) -> dict:
    """
    Params: latitude, longitude
    Current vars: temperature_2m, relative_humidity_2m,
                  precipitation, wind_speed_10m, weather_code
    Timezone: Asia/Kolkata
    Returns: {temperature_c, rainfall_mm, humidity_percent, wind_speed_kmh, weather_code}
    """
    params: dict[str, str | float] = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        "timezone": "Asia/Kolkata"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{settings.OPENMETEO_BASE_URL}/forecast", params=params)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        
        return {
            "temperature_c": current.get("temperature_2m", 0.0),
            "rainfall_mm": current.get("precipitation", 0.0),
            "humidity_percent": current.get("relative_humidity_2m", 0.0),
            "wind_speed_kmh": current.get("wind_speed_10m", 0.0),
            "weather_code": current.get("weather_code", 0)
        }

async def get_historical_annual(lat: float, lon: float, year: int) -> dict:
    """
    Uses /archive endpoint.
    Date range: {year}-01-01 to {year}-12-31
    Daily vars: temperature_2m_max, temperature_2m_min, precipitation_sum
    Returns: {annual_rainfall_mm, mean_temp_c, max_temp_c, dry_days_count}
    """
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    
    params: dict[str, str | float] = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "Asia/Kolkata"
    }
    
    # Use the archive API
    archive_url = "https://archive-api.open-meteo.com/v1/archive"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(archive_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        daily = data.get("daily", {})
        precip = daily.get("precipitation_sum", [])
        t_max = daily.get("temperature_2m_max", [])
        t_min = daily.get("temperature_2m_min", [])
        
        # Filter out None values
        valid_precip = [p for p in precip if p is not None]
        valid_t_max = [t for t in t_max if t is not None]
        valid_t_min = [t for t in t_min if t is not None]
        
        annual_rainfall = sum(valid_precip)
        dry_days = sum(1 for p in valid_precip if p < 1.0)
        max_temp = max(valid_t_max) if valid_t_max else 0.0
        
        # Approximate mean by averaging all valid min/max
        mean_temp = 0.0
        if valid_t_max and valid_t_min:
            mean_temp = sum([(m + n) / 2 for m, n in zip(valid_t_max, valid_t_min)]) / len(valid_t_max)
            
        return {
            "annual_rainfall_mm": annual_rainfall,
            "mean_temp_c": mean_temp,
            "max_temp_c": max_temp,
            "dry_days_count": dry_days
        }