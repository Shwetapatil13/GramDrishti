import pytest
from app.models.village import EnvironmentalMetrics, LandCoverBreakdown
from app.services.scoring.health_score import (
    calculate_water_score,
    calculate_vegetation_score,
    calculate_climate_score,
    calculate_flood_score,
    calculate_land_score,
    calculate_overall_score,
    WEIGHTS
)

def build_metrics(
    ndvi=0.5, ndwi=0.0, water_area=50.0, green_cover=40.0,
    temp=30.0, rain=1000.0, hum=50.0,
    trees=20.0, crop=20.0, bare=5.0, built=5.0, flooded=0.0
) -> EnvironmentalMetrics:
    lc = LandCoverBreakdown(
        cropland=crop, trees=trees, water=water_area/100,
        builtArea=built, grassland=10.0, bareLand=bare, flooded=flooded
    )
    return EnvironmentalMetrics(
        villageId="test_village", year=2024,
        ndvi=ndvi, ndwi=ndwi, waterAreaHa=water_area,
        greenCoverPercent=green_cover, landCover=lc,
        temperature=temp, rainfall=rain, humidity=hum, windSpeed=10.0,
        dataSource="live"
    )

def test_weights_sum():
    assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9

def test_water_score_bounds():
    # Zero inputs
    m_zero = build_metrics(ndwi=-1.0, water_area=0.0, rain=0.0)
    score_zero = calculate_water_score(m_zero)
    assert 0 <= score_zero.score <= 100
    
    # Max inputs
    m_max = build_metrics(ndwi=1.0, water_area=10000.0, rain=5000.0)
    score_max = calculate_water_score(m_max)
    assert 0 <= score_max.score <= 100

def test_vegetation_score_bounds():
    m_zero = build_metrics(ndvi=-1.0, green_cover=0.0, trees=0.0)
    assert 0 <= calculate_vegetation_score(m_zero).score <= 100
    
    m_max = build_metrics(ndvi=1.0, green_cover=100.0, trees=100.0)
    assert 0 <= calculate_vegetation_score(m_max).score <= 100

def test_climate_score_bounds():
    m_severe = build_metrics(temp=50.0, rain=100.0, hum=90.0, ndvi=0.1) # High penalties
    score = calculate_climate_score(m_severe).score
    assert 0 <= score <= 100
    
    m_perfect = build_metrics(temp=25.0, rain=1200.0, hum=40.0, ndvi=0.8) # No penalties
    assert 0 <= calculate_climate_score(m_perfect).score <= 100

def test_flood_score_bounds():
    m_severe = build_metrics(rain=2000.0, flooded=20.0)
    assert 0 <= calculate_flood_score(m_severe).score <= 100
    
    m_perfect = build_metrics(rain=500.0, flooded=0.0)
    assert 0 <= calculate_flood_score(m_perfect).score <= 100

def test_land_score_bounds():
    m_severe = build_metrics(bare=50.0, built=30.0, crop=5.0, green_cover=10.0)
    assert 0 <= calculate_land_score(m_severe).score <= 100
    
    m_perfect = build_metrics(bare=0.0, built=5.0, crop=40.0, green_cover=80.0)
    assert 0 <= calculate_land_score(m_perfect).score <= 100

def test_trend_calculation():
    m = build_metrics()
    score1 = calculate_water_score(m, prev_score=40.0)
    # If current is ~ 40+ depending on formula, delta could be anything. Let's just force scores.
    # We will test the trend directly on overall for better mock
    
    res_improving = calculate_water_score(build_metrics(water_area=500.0, ndwi=0.8, rain=2000), prev_score=10.0)
    assert res_improving.trend == "improving"
    
    res_declining = calculate_water_score(build_metrics(water_area=0.0, ndwi=-0.5, rain=0.0), prev_score=90.0)
    assert res_declining.trend == "declining"
    
    res_stable = calculate_water_score(build_metrics(), prev_score=calculate_water_score(build_metrics()).score)
    assert res_stable.trend == "stable"

def test_overall_score():
    m = build_metrics()
    components = {
        "water": calculate_water_score(m),
        "vegetation": calculate_vegetation_score(m),
        "climate": calculate_climate_score(m),
        "flood": calculate_flood_score(m),
        "land": calculate_land_score(m)
    }
    res = calculate_overall_score(components)
    assert 0 <= res.overall <= 100
