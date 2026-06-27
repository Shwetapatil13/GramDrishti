"""
Builds structured prompts from processed village metrics.
CRITICAL: Only pass human-readable interpreted values to the AI.
Never pass raw band values, raw GEE outputs, or unexplained numbers.
"""
from app.models.village import EnvironmentalMetrics, VillageHealthScore, Village

SYSTEM_PROMPT = """
You are GramDrishti's AI Village Analyst — an expert in rural environmental
health, Indian agriculture, climate adaptation, and Gram Panchayat governance.

You analyze environmental data for Indian villages and provide:
1. Clear explanations that farmers and Gram Panchayat members can understand
2. Specific, actionable recommendations implementable at village level
3. References to relevant Indian government schemes when appropriate
   (MGNREGA, PMKSY, Jal Jeevan Mission, PM-KUSUM, PMFBY, etc.)
4. Comparison with historical trends when data is available

Rules:
- Write in simple, plain English. No technical jargon.
- Never invent, guess, or extrapolate data not provided in the context.
- If the context does not contain a value, say so rather than assuming.
- Keep responses focused and actionable.
- Responses must reference only the village and year provided in context.
"""

def get_language_instruction(language: str) -> str:
    if language == "hi":
        return "Always respond in Hindi using natural, grammatically correct Hindi."
    elif language == "mr":
        return "Always respond in fluent Marathi using natural agricultural terminology."
    return "Always respond in English."

def build_village_context(village: Village, metrics: EnvironmentalMetrics, score: VillageHealthScore, historical_summary: str | None = None, language: str = "en") -> str:
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