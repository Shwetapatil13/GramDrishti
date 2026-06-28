def compress_historical_data(history_data) -> str:
    if not history_data or not hasattr(history_data, "metrics"):
        return "No historical data available."
    
    years = [m.year for m in history_data.metrics]
    ndvis = [m.ndvi for m in history_data.metrics if hasattr(m, 'ndvi')]
    
    if not years:
        return "No historical data available."
        
    start_year, end_year = min(years), max(years)
    
    # Simple summary instead of raw array
    summary = f"Historical Data from {start_year} to {end_year}: "
    if ndvis:
        avg_ndvi = sum(ndvis) / len(ndvis)
        trend = "stable"
        if ndvis[-1] - ndvis[0] > 0.05:
            trend = "improving"
        elif ndvis[0] - ndvis[-1] > 0.05:
            trend = "declining"
        summary += f"Average NDVI is {avg_ndvi:.2f} and the trend is {trend}."
        
    return summary

def compress_weather_data(weather_data: dict) -> str:
    if not weather_data:
        return "No weather data available."
    
    # Just return a small string instead of full JSON
    rainfall = weather_data.get("annual_rainfall_mm", "Unknown")
    mean_temp = weather_data.get("mean_temp_c", "Unknown")
    return f"Annual Rainfall: {rainfall}mm, Mean Temp: {mean_temp}°C"
