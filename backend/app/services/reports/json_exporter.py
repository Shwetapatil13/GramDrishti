import json
from app.models.village import Village, EnvironmentalMetrics, VillageHealthScore, HistoricalData
from app.models.recommendations import AIRecommendationModel
from typing import Dict, Any


def export_village_json(
    village: Village,
    metrics: EnvironmentalMetrics,
    score: VillageHealthScore,
    recommendations: list[AIRecommendationModel],
    history: HistoricalData
) -> str:
    """
    Returns complete village data as a structured JSON string.
    """
    export_data = {
        "village": village.model_dump(),
        "current_metrics": metrics.model_dump(),
        "current_score": score.model_dump(),
        "recommendations": [r.model_dump() for r in recommendations],
        "history": history.model_dump()
    }

    return json.dumps(export_data, indent=2)
