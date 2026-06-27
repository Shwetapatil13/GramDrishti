from typing import List, Dict, Any, Literal
from app.models.village import VillageHealthScore


def get_risk_level(
        score: float) -> Literal["critical", "high", "medium", "low"]:
    if score <= 40:
        return "critical"
    elif score <= 60:
        return "high"
    elif score <= 75:
        return "medium"
    else:
        return "low"


def rank_risks(score: VillageHealthScore) -> List[Dict[str, Any]]:
    """
    Rank all 5 components by risk level.
    Returns sorted list: critical first, then high, medium, low.
    Each item: {component, score, risk_level, urgency, one_line_explanation}
    """
    components: List[Dict[str,
                          Any]] = [{"component": "Water Security",
                                    "score": score.water.score,
                                    "explanation": score.water.explanation},
                                   {"component": "Vegetation Health",
                                    "score": score.vegetation.score,
                                    "explanation": score.vegetation.explanation},
                                   {"component": "Climate Stability",
                                    "score": score.climate.score,
                                    "explanation": score.climate.explanation},
                                   {"component": "Flood Preparedness",
                                    "score": score.flood.score,
                                    "explanation": score.flood.explanation},
                                   {"component": "Land Sustainability",
                                    "score": score.land.score,
                                    "explanation": score.land.explanation}]

    for comp in components:
        s_val = float(comp["score"])
        comp["risk_level"] = get_risk_level(s_val)
        comp["urgency"] = comp["risk_level"]  # Map directly for simplicity

        # safely handle explanation string split
        expl = str(comp["explanation"])
        comp["one_line_explanation"] = expl.split('.')[0] + '.'

    # Sort by score ascending (lowest score = highest risk)
    components.sort(key=lambda x: float(x["score"]))

    return components
