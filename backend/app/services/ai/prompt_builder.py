"""
Builds structured prompts from processed village metrics.
CRITICAL: Only pass human-readable interpreted values to the AI.
Never pass raw band values, raw GEE outputs, or unexplained numbers.
"""
from app.models.village import EnvironmentalMetrics, VillageHealthScore, Village

SYSTEM_PROMPT = """
You are GramDrishti's AI Village Decision Support Assistant — an expert in rural environmental health, Indian agriculture, climate adaptation, and Gram Panchayat governance.

CRITICAL INSTRUCTION: You are a Data-Driven Engine. You must NEVER answer using generic knowledge if village data is available. Every response MUST be grounded entirely in the provided RAG context.

Source Priority:
1. Selected Village Database
2. GIS Layers & Active Map State
3. Satellite Analysis & Clicked Location Data
4. AI Prediction Engine
5. Weather Data
6. Historical Reports
7. Government Schemes
8. General Knowledge (ONLY if explicitly asked a generic question not related to the village)

Formatting Rules:
Every answer must follow this strict structure:
### Summary
[Short conclusion]

### Evidence
[Reference specific retrieved data: GIS values, Weather, Predictions, etc.]

### Analysis
[Explain why the situation exists based on the evidence]

### Recommendations
[Provide actionable, village-specific recommendations]

### Confidence
[High/Medium/Low based on data completeness]

General Rules:
- If a value is missing from the context, explicitly state: "This information is currently unavailable." DO NOT invent or assume values.
- Never give generic advice like "Water conservation is important." Always reference the specific watershed, NDVI layer, or rainfall data.
- If the user clicks on the map, focus your answer on the coordinates and features of the Clicked Location.
- Understand spatial relationships (e.g. "near the river" means look at water layers and coordinates).
"""


def get_language_instruction(language: str) -> str:
    if language == "hi":
        return "Always respond in Hindi using natural, grammatically correct Hindi."
    elif language == "mr":
        return "Always respond in fluent Marathi using natural agricultural terminology."
    return "Always respond in English."


def build_village_context(
        village: Village,
        metrics: EnvironmentalMetrics,
        score: VillageHealthScore,
        historical_summary: str | None = None,
        language: str = "en") -> str:
    """
    Build human-readable context string.
    """
    lines = [
        f"Context for Village: {village.name} (District: {village.district}, State: {village.state}) - Year {metrics.year}",
        "",
        "--- HEALTH SCORES (Out of 100) ---",
        f"Overall Health: {score.overall:.1f}/100",
        f"Water Security: {score.water.score:.1f}/100 - Trend: {score.water.trend} - {score.water.explanation}",
        f"Vegetation Health: {score.vegetation.score:.1f}/100 - Trend: {score.vegetation.trend} - {score.vegetation.explanation}",
        f"Climate Stability: {score.climate.score:.1f}/100 - Trend: {score.climate.trend} - {score.climate.explanation}",
        f"Flood Preparedness: {score.flood.score:.1f}/100 - Trend: {score.flood.trend} - {score.flood.explanation}",
        f"Land Sustainability: {score.land.score:.1f}/100 - Trend: {score.land.trend} - {score.land.explanation}",
        "",
        "--- ENVIRONMENTAL METRICS ---",
        f"NDVI (Vegetation Index): {metrics.ndvi:.2f} (-1 to 1 scale)",
        f"Surface Water Area: {metrics.waterAreaHa:.1f} Hectares",
        f"Green Cover: {metrics.greenCoverPercent:.1f}%",
        f"Annual Rainfall: {metrics.rainfall:.1f} mm",
        f"Average Temperature: {metrics.temperature:.1f} °C",
    ]

    if historical_summary:
        lines.append("")
        lines.append("--- HISTORICAL CONTEXT ---")
        lines.append(historical_summary)

    lines.append("")
    lines.append("--- LANGUAGE REQUIREMENT ---")
    lines.append(f"CRITICAL: {get_language_instruction(language)}")

    return "\n".join(lines)


def build_summary_prompt(context: str) -> str:
    return f"{SYSTEM_PROMPT}\n\nTask: Provide a 2-3 paragraph executive summary of the village's environmental health based on the following context. Do not use markdown headers, just plain paragraphs.\n\nContext:\n{context}"


def build_recommendation_prompt(context: str) -> str:
    return f"{SYSTEM_PROMPT}\n\nTask: Based on the context below, provide exactly 3 specific, actionable recommendations prioritizing the most critical areas. Your output MUST be a valid JSON array of objects, with no extra text. Each object must have these keys: priority (integer 1, 2, or 3), category (string: water, vegetation, climate, flood, or land), title (string), description (string), scheme (string or null), expectedImpact (string), timeframe (string), costEstimate (string or null), urgency (string: low, medium, high, or critical).\n\nContext:\n{context}"


def build_qa_prompt(question: str, context: str) -> str:
    return f"{SYSTEM_PROMPT}\n\nContext:\n{context}\n\nUser Question: {question}\n\nTask: Answer the user's question clearly and concisely based ONLY on the context provided."


def build_report_narrative_prompt(context: str) -> str:
    return f"{SYSTEM_PROMPT}\n\nTask: Write a comprehensive, professional narrative report section detailing the village's environmental health, climate risks, and overall trajectory. Do not include recommendations here. Ensure it flows well for a formal PDF document.\n\nContext:\n{context}"

def assemble_dynamic_prompt(
        intents: list[str],
        structured_json: dict,
        map_state: dict | None,
        clicked_location: dict | None,
        language: str = "en") -> str:
    
    import json
    
    confidence = structured_json.get("retrieved_data", {}).get("confidence", {}).get("overall_label", "Unknown")

    lines = [
        SYSTEM_PROMPT,
        "",
        "--- EXPLAINABILITY & HALLUCINATION GUARD RULES ---",
        "1. You are the Explainability Engine. You must ONLY use the data provided in the STRUCTURED DECISION JSON below.",
        "2. Do NOT invent, estimate, or infer numeric values, risks, or trends. Use the pre-computed processor insights.",
        "3. If a value is missing, explicitly state that the data is unavailable.",
        "4. Format every conclusion as: Evidence -> Reasoning -> Recommendation -> Expected Outcome.",
        "5. Include Source Attribution tags where applicable (e.g. 'Source: Google Earth Engine').",
        "6. Provide 3-5 suggested Follow-up Questions at the end of your response.",
        "7. DO NOT USE EMOJIS UNDER ANY CIRCUMSTANCES. Maintain a professional, enterprise-grade tone.",
        "",
        f"--- DYNAMIC RAG CONTEXT (Overall Confidence: {confidence}) ---",
        "STRUCTURED DECISION JSON:",
        json.dumps(structured_json, indent=2, default=str),
    ]

    if map_state and map_state.get("visibleLayers"):
        lines.append(f"\nACTIVE GIS MAP LAYERS SEEN BY USER: {', '.join(map_state.get('visibleLayers'))}")

    if clicked_location:
        lines.append(f"\nUSER CLICKED LOCATION ON MAP: Lat: {clicked_location.get('lat')}, Lng: {clicked_location.get('lng')}")

    lines.append(f"\nDETECTED INTENTS: {', '.join(intents)}")
    lines.append(f"\n--- LANGUAGE REQUIREMENT ---\nCRITICAL: {get_language_instruction(language)}")

    return "\n".join(lines)

