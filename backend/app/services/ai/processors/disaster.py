def process(context_blocks: dict) -> dict:
    weather = context_blocks.get("historical_weather", {}).get("value", {})
    score = context_blocks.get("score", {}).get("value", {})
    
    rainfall = weather.get("annual_rainfall_mm", 0.0)
    flood_score = score.get("flood", {}).get("score", 50.0) if isinstance(score, dict) else 50.0
    
    risk_level = "Low"
    if flood_score < 40 or rainfall > 1500:
        risk_level = "High"
    elif flood_score < 60 or rainfall > 1000:
        risk_level = "Medium"
        
    recommendations = []
    if risk_level == "High":
        recommendations.append({
            "priority": 1,
            "title": "Flood Preparedness Audit",
            "impact": "High",
            "effort": "Medium",
            "reason": f"High rainfall ({rainfall}mm) or poor flood readiness score ({flood_score})."
        })
        
    metrics_array = [
        {
            "name": "Flood Risk",
            "value": risk_level,
            "unit": "",
            "trend": "N/A",
            "status": "Critical" if risk_level == "High" else "Warning" if risk_level == "Medium" else "Good",
            "source": "AI Inference Engine",
            "timestamp": "2024-06-28"
        }
    ]
    
    actions_array = [
        {"type": "toggle_layer", "layer": "flood_zone"}
    ]
        
    return {
        "domain": "Disaster",
        "metrics": metrics_array,
        "charts": [],
        "actions": actions_array,
        "recommendations": recommendations
    }
