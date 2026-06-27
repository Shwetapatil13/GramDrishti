"""
Environmental metrics interpreter.
Transforms raw GEE values into normalized, human-readable scores and categories.
All functions return dicts with at minimum: value, category, description.
All output values are validated against expected ranges before return.
"""
from typing import Dict, Any


def interpret_ndvi(ndvi_mean: float) -> Dict[str, Any]:
    """
    NDVI health interpretation.
    > 0.6:  Dense vegetation (excellent) → category "excellent"
    0.4-0.6: Moderate vegetation → category "good"
    0.2-0.4: Sparse vegetation → category "fair"
    < 0.2:  Bare/degraded → category "poor"
    Returns: {value, category, description, percent_healthy_vegetation}
    """
    val = max(-1.0, min(1.0, ndvi_mean))

    if val > 0.6:
        cat = "excellent"
        desc = "Dense, healthy vegetation coverage."
        phv = 85.0
    elif val >= 0.4:
        cat = "good"
        desc = "Moderate vegetation coverage, generally healthy."
        phv = 60.0
    elif val >= 0.2:
        cat = "fair"
        desc = "Sparse or stressed vegetation."
        phv = 30.0
    else:
        cat = "poor"
        desc = "Bare soil, highly degraded or urbanized."
        phv = 10.0

    return {
        "value": val,
        "category": cat,
        "description": desc,
        "percent_healthy_vegetation": phv
    }


def interpret_water_stress(
        ndwi: float, water_area_ha: float, village_area_km2: float) -> Dict[str, Any]:
    """
    Returns: {stress_level, water_coverage_percent, assessment}
    Handles zero-water villages: stress_level "critical", coverage 0.0
    """
    # Protect against div by zero
    area_km2 = max(0.001, village_area_km2)
    # water area ha to km2 = / 100
    coverage_percent = (water_area_ha / 100.0) / area_km2 * 100.0

    if water_area_ha <= 0 or coverage_percent <= 0.1:
        stress_level = "critical"
        assessment = "Severe water scarcity detected."
        coverage_percent = 0.0
    elif coverage_percent < 2.0:
        stress_level = "high"
        assessment = "Low surface water presence, potential stress."
    elif coverage_percent < 5.0:
        stress_level = "moderate"
        assessment = "Adequate surface water relative to area."
    else:
        stress_level = "low"
        assessment = "Abundant surface water resources."

    return {
        "stress_level": stress_level,
        "water_coverage_percent": min(100.0, max(0.0, coverage_percent)),
        "assessment": assessment
    }


def calculate_green_cover(land_cover: Dict[str, float]) -> float:
    """
    Green cover = trees + grass + crops + shrub_and_scrub (all in percent)
    Validated: output always 0.0–100.0
    """
    if not land_cover:
        return 0.0

    total = sum([
        land_cover.get("trees", 0.0),
        land_cover.get("grass", 0.0),
        land_cover.get("crops", 0.0),
        land_cover.get("shrub_and_scrub", 0.0)
    ])

    return min(100.0, max(0.0, total))


def assess_flood_risk(terrain: Dict[str,
                                    float],
                      land_cover: Dict[str,
                                       float],
                      annual_rainfall_mm: float) -> Dict[str,
                                                         Any]:
    """
    Flood risk combines: slope < 2° area, flooded_vegetation %, rainfall intensity.
    Returns: {risk_level: "low"|"medium"|"high"|"critical", risk_score: float, explanation: str}
    """
    flat_area = terrain.get("flood_risk_area_percent", 0.0)
    flooded_veg = land_cover.get("flooded_vegetation", 0.0)

    # Rough scoring heuristic: flat area is risky, existing flooding is very
    # risky, high rainfall multiplies
    score = flat_area * 0.5 + flooded_veg * 2.0
    if annual_rainfall_mm > 1500:
        score += 20.0
    elif annual_rainfall_mm > 1000:
        score += 10.0

    score = min(100.0, max(0.0, score))

    if score > 60:
        risk = "critical"
        exp = "High proportion of flat terrain with historical flooding indicates critical flood vulnerability."
    elif score > 40:
        risk = "high"
        exp = "Significant flat areas and drainage indicators suggest high flood risk."
    elif score > 20:
        risk = "medium"
        exp = "Moderate flood risk based on terrain topology."
    else:
        risk = "low"
        exp = "Low flood risk; good drainage indicated by slopes."

    return {
        "risk_level": risk,
        "risk_score": score,
        "explanation": exp
    }
