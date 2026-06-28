from datetime import datetime
from typing import List, Dict, Any
from app.services.village_service import get_village_by_id
from app.api.routes.satellite import get_village_metrics
from app.api.routes.scores import get_village_score
from app.core.logging import get_logger
from app.services.ai.audit import AuditLogger

logger = get_logger(__name__)

def wrap_metric(value: Any, source: str, confidence: str = "High"):
    return {
        "value": value,
        "source": source,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d"),
        "confidence": confidence
    }

class RetrievalEngine:
    async def fetch(self, village_id: str, year: int, intents: List[str], clicked_location: Dict[str, Any] | None, audit: AuditLogger) -> Dict[str, Any]:
        """
        Orchestrates retrieval based on classified intents with Source Attribution.
        """
        context_blocks = {}
        village = get_village_by_id(village_id)
        if not village:
            return context_blocks

        context_blocks["village"] = wrap_metric(village.model_dump() if hasattr(village, "model_dump") else village, "Village Database")
        
        # Always fetch core metrics
        metrics = await get_village_metrics(village_id, year)
        score = await get_village_score(village_id, year)
        
        context_blocks["metrics"] = wrap_metric(metrics.model_dump() if hasattr(metrics, "model_dump") else metrics, "Google Earth Engine")
        context_blocks["score"] = wrap_metric(score.model_dump() if hasattr(score, "model_dump") else score, "AI Prediction Engine")
        
        audit.log_retrieval("village_base")
        audit.log_retrieval("core_metrics")
        skipped_logs = []

        if "weather" in intents or "agriculture" in intents or "water" in intents:
            try:
                from app.services.weather.openmeteo import get_current_weather, get_historical_annual
                lat, lon = village.coordinates
                context_blocks["current_weather"] = wrap_metric(await get_current_weather(lat, lon), "Open-Meteo API")
                context_blocks["historical_weather"] = wrap_metric(await get_historical_annual(lat, lon, year), "Open-Meteo API")
                audit.log_retrieval("weather")
            except Exception as e:
                logger.error(f"Failed to fetch weather: {e}")
        else:
            skipped_logs.append("weather")

        if "agriculture" in intents or "disaster" in intents or "general" in intents:
            try:
                from app.services.scoring.history import get_historical_data
                years_to_fetch = [y for y in range(year-3, year+1)]
                history_data = await get_historical_data(village_id, years_to_fetch)
                context_blocks["history_data"] = wrap_metric(
                    [m.model_dump() if hasattr(m, 'model_dump') else m for m in history_data.metrics] if hasattr(history_data, "metrics") else history_data,
                    "Historical Database"
                )
                audit.log_retrieval("historical_data")
            except Exception as e:
                logger.error(f"Failed to fetch historical data: {e}")
        else:
            skipped_logs.append("historical_data")

        # Map point sampling
        if clicked_location:
            try:
                from app.services.gee.processor import sample_point_metrics
                lat = clicked_location.get("lat")
                lon = clicked_location.get("lng")
                if lat and lon:
                    point_data = await sample_point_metrics(lat, lon, year)
                    context_blocks["point_data"] = wrap_metric(point_data, "Google Earth Engine Raster Sample")
                    audit.log_retrieval("point_sampling")
            except Exception as e:
                logger.error(f"Failed to sample point: {e}")
        
        logger.info(f"Retrieval complete for village {village_id}.")
        return context_blocks
