from pydantic import BaseModel, Field

class Sentinel2Metrics(BaseModel):
    ndvi_mean: float
    ndwi_mean: float
    red_mean: float
    nir_mean: float
    swir_mean: float

class LandCoverMetrics(BaseModel):
    water: float
    trees: float
    grass: float
    flooded_vegetation: float
    crops: float
    shrub_and_scrub: float
    built: float
    bare: float
    snow_and_ice: float

class TerrainMetrics(BaseModel):
    mean_elevation_m: float
    slope_mean_degrees: float
    slope_std_degrees: float
    flood_risk_area_percent: float

class WaterMetrics(BaseModel):
    water_area_ha: float
    water_coverage_percent: float
    seasonal_water_months: float
    water_occurrence_mean: float

class EnvironmentalMetricsResponse(BaseModel):
    villageId: str
    year: int
    ndvi: float
    ndwi: float
    waterAreaHa: float
    greenCoverPercent: float
    landCover: dict
    temperature: float
    rainfall: float
    humidity: float
    windSpeed: float
    dataSource: str