def process(context_blocks: dict) -> dict:
    metrics = context_blocks.get("metrics", {}).get("value", {})
    history = context_blocks.get("history_data", {}).get("value", [])
    weather = context_blocks.get("historical_weather", {}).get("value", {})
    
    ndwi = metrics.get("ndwi", 0.0)
    rainfall = weather.get("annual_rainfall_mm", 0.0)
    
    trend = "Stable"
    if isinstance(history, list) and len(history) > 1:
        first_ndwi = history[0].get("ndwi", 0.0)
        if ndwi - first_ndwi > 0.05:
            trend = "Improving"
        elif first_ndwi - ndwi > 0.05:
            trend = "Declining"
            
    recommendations = []
    
    if ndwi < 0.1:
        recommendations.append({
            "priority": 1,
            "title": "Immediate Water Conservation",
            "impact": "High",
            "effort": "High",
            "reason": f"NDWI ({ndwi:.2f}) indicates severe surface water depletion."
        })
    elif rainfall > 0 and rainfall < 500:
        recommendations.append({
            "priority": 2,
            "title": "Rainwater Harvesting Check",
            "impact": "Medium",
            "effort": "Medium",
            "reason": f"Annual rainfall ({rainfall}mm) is critically low."
        })
        
    metrics_array = [
        {
            "name": "NDWI",
            "value": round(ndwi, 2),
            "unit": "",
            "trend": trend,
            "status": "Warning" if ndwi < 0.1 else "Good",
            "source": "Google Earth Engine",
            "timestamp": "2024-06-28"
        },
        {
            "name": "Rainfall",
            "value": rainfall,
            "unit": "mm",
            "trend": "Stable",
            "status": "Warning" if rainfall < 500 else "Good",
            "source": "Open-Meteo",
            "timestamp": "2024-06-28"
        }
    ]
    
    charts_array = []
    if isinstance(history, list) and len(history) > 1:
        years = [h.get("year", 2020 + i) for i, h in enumerate(history)]
        ndwis = [h.get("ndwi", 0.0) for h in history]
        charts_array.append({
            "type": "line",
            "title": "NDWI Trend",
            "x": years,
            "y": ndwis
        })
        
    actions_array = [
        {"type": "toggle_layer", "layer": "water"}
    ]
        
    return {
        "domain": "Water",
        "metrics": metrics_array,
        "charts": charts_array,
        "actions": actions_array,
        "recommendations": recommendations
    }
