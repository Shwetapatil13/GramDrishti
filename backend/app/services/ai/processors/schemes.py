def process(context_blocks: dict) -> dict:
    metrics = context_blocks.get("metrics", {}).get("value", {})
    weather = context_blocks.get("historical_weather", {}).get("value", {})
    
    ndvi = metrics.get("ndvi", 0.5)
    ndwi = metrics.get("ndwi", 0.2)
    rainfall = weather.get("annual_rainfall_mm", 800)
    
    matched_schemes = []
    
    if ndwi < 0.15 or rainfall < 600:
        matched_schemes.append({
            "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
            "priority": 1,
            "expected_benefit": "Improve irrigation efficiency and water conservation.",
            "reason": f"Triggered by low water availability (NDWI: {ndwi:.2f}, Rainfall: {rainfall}mm)"
        })
        
    if ndvi < 0.4:
        matched_schemes.append({
            "name": "Soil Health Card Scheme",
            "priority": 2,
            "expected_benefit": "Diagnose soil deficiencies reducing crop yield.",
            "reason": f"Triggered by poor vegetation health (NDVI: {ndvi:.2f})"
        })
        
    actions_array = [
        {"type": "generate_report", "report_type": "schemes"}
    ]
        
    return {
        "domain": "Schemes",
        "metrics": [],
        "charts": [],
        "actions": actions_array,
        "recommendations": matched_schemes
    }
