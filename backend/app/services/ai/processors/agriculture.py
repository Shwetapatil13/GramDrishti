def process(context_blocks: dict) -> dict:
    metrics = context_blocks.get("metrics", {}).get("value", {})
    history = context_blocks.get("history_data", {}).get("value", [])
    
    ndvi = metrics.get("ndvi", 0.0)
    
    trend = "Stable"
    trend_val = 0.0
    if isinstance(history, list) and len(history) > 1:
        # history might be sorted by year. Assumes last is most recent.
        first_ndvi = history[0].get("ndvi", 0.0)
        trend_val = ndvi - first_ndvi
        if trend_val > 0.05:
            trend = "Improving"
        elif trend_val < -0.05:
            trend = "Declining"
            
    recommendations = []
    if ndvi < 0.4:
        recommendations.append({
            "priority": 1,
            "title": "Soil Moisture Intervention Required",
            "impact": "High",
            "effort": "Medium",
            "reason": f"Current NDVI ({ndvi:.2f}) indicates severe crop stress."
        })
    elif trend == "Declining":
        recommendations.append({
            "priority": 2,
            "title": "Investigate Crop Health Trend",
            "impact": "Medium",
            "effort": "Low",
            "reason": "NDVI is declining compared to historical averages."
        })
        
    metrics_array = [
        {
            "name": "NDVI",
            "value": round(ndvi, 2),
            "unit": "",
            "trend": trend,
            "status": "Warning" if ndvi < 0.4 else "Good",
            "source": "Google Earth Engine",
            "timestamp": "2024-06-28"
        }
    ]
    
    charts_array = []
    if isinstance(history, list) and len(history) > 1:
        years = [h.get("year", 2020 + i) for i, h in enumerate(history)]
        ndvis = [h.get("ndvi", 0.0) for h in history]
        charts_array.append({
            "type": "line",
            "title": "NDVI Trend",
            "x": years,
            "y": ndvis
        })
        
    actions_array = [
        {"type": "toggle_layer", "layer": "ndvi"}
    ]
        
    return {
        "domain": "Agriculture",
        "metrics": metrics_array,
        "charts": charts_array,
        "actions": actions_array,
        "recommendations": recommendations
    }
