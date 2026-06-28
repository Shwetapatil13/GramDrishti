def calculate_confidence(retrieved_blocks: dict) -> dict:
    """
    Computes confidence algorithmically based on data availability.
    Base Score = (0.35 * GIS) + (0.25 * Weather) + (0.20 * History) + (0.20 * Predictions)
    """
    
    gis_available = 1 if "metrics" in retrieved_blocks or "point_data" in retrieved_blocks else 0
    weather_available = 1 if "current_weather" in retrieved_blocks or "historical_weather" in retrieved_blocks else 0
    history_available = 1 if "history_data" in retrieved_blocks else 0
    predictions_available = 1 if "score" in retrieved_blocks else 0

    overall_score = (0.35 * gis_available) + (0.25 * weather_available) + (0.20 * history_available) + (0.20 * predictions_available)
    
    if overall_score >= 0.8:
        overall_label = "High"
    elif overall_score >= 0.5:
        overall_label = "Medium"
    else:
        overall_label = "Low"

    return {
        "overall_score": round(overall_score, 2),
        "overall_label": overall_label,
        "breakdown": {
            "gis": gis_available,
            "weather": weather_available,
            "history": history_available,
            "predictions": predictions_available
        }
    }
