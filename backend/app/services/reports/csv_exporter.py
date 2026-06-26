import csv
import io
from app.models.village import HistoricalData

def export_historical_csv(history: HistoricalData) -> str:
    """
    Export historical metrics to CSV.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    headers = ["Metric"] + [str(y) for y in history.years]
    writer.writerow(headers)
    
    # Organize data rows
    metrics_by_year = {m.year: m for m in history.metrics}
    
    def get_row(metric_name: str, key_extractor):
        row = [metric_name]
        for year in history.years:
            if year in metrics_by_year:
                val = key_extractor(metrics_by_year[year])
                row.append(f"{val:.2f}" if isinstance(val, float) else str(val))
            else:
                row.append("N/A")
        return row
        
    writer.writerow(get_row("NDVI", lambda m: m.ndvi))
    writer.writerow(get_row("NDWI", lambda m: m.ndwi))
    writer.writerow(get_row("Water Area (ha)", lambda m: m.waterAreaHa))
    writer.writerow(get_row("Green Cover (%)", lambda m: m.greenCoverPercent))
    writer.writerow(get_row("Temperature (C)", lambda m: m.temperature))
    writer.writerow(get_row("Rainfall (mm)", lambda m: m.rainfall))
    writer.writerow(get_row("Humidity (%)", lambda m: m.humidity))
    writer.writerow(get_row("Wind Speed (km/h)", lambda m: m.windSpeed))
    
    # Adding land cover classes as well
    lc_keys = ["cropland", "trees", "water", "builtArea", "grassland", "bareLand", "flooded"]
    for lk in lc_keys:
        writer.writerow(get_row(f"LC: {lk.capitalize()} (%)", lambda m, k=lk: getattr(m.landCover, k)))
        
    return output.getvalue()