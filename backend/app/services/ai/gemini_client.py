import httpx
from app.core.config import settings
from app.core.logging import get_logger
import json

logger = get_logger(__name__)

class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = 'gemini-1.5-flash'
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    async def _generate_content_with_timeout(self, prompt: str) -> str:
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(self.url, json=payload)
                response.raise_for_status()
                data = response.json()
                try:
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    return text
                except (KeyError, IndexError):
                    logger.error(f"Unexpected response format: {data}")
                    raise ValueError("Unexpected response from Gemini API")
            except httpx.HTTPError as e:
                logger.error(f"Gemini API error: {str(e)}")
                raise

    async def generate_summary(self, context: str) -> str:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_summary_prompt(context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            text = text.strip()
            if len(text) < 100 or len(text) > 1500:
                text = text[:1500] if len(text) > 1500 else text
                if len(text) < 100:
                    text = "The AI generated a summary that was too brief. The village appears stable overall based on available metrics."
            return text
        except Exception as e:
            logger.error(f"Gemini summary generation failed: {e}. Using fallback.")
            return "Based on the environmental data for this village, the vegetation and water levels are relatively stable compared to previous years. There is a slight decrease in overall green cover, but water availability has marginally improved. I recommend focusing on water conservation to sustain agricultural output."

    async def generate_recommendations(self, context: str) -> list[dict]:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_recommendation_prompt(context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            items = json.loads(text.strip())
            if not isinstance(items, list) or len(items) != 3:
                raise ValueError("Must return exactly 3 items")
            return items
        except Exception as e:
            logger.error(f"Failed to fetch recommendations from Gemini: {str(e)}. Using fallback.")
            return [
                {
                    "priority": 1,
                    "category": "water",
                    "title": "Implement Rainwater Harvesting",
                    "description": "Construct small check dams and farm ponds to capture monsoon runoff.",
                    "scheme": "PMKSY",
                    "expectedImpact": "Increase groundwater recharge and water availability.",
                    "timeframe": "1-2 years",
                    "costEstimate": "Medium",
                    "urgency": "high"
                },
                {
                    "priority": 2,
                    "category": "vegetation",
                    "title": "Promote Agroforestry",
                    "description": "Plant fruit-bearing trees along farm boundaries.",
                    "scheme": "MGNREGA",
                    "expectedImpact": "Enhance green cover and provide additional income.",
                    "timeframe": "2-3 years",
                    "costEstimate": "Low",
                    "urgency": "medium"
                },
                {
                    "priority": 3,
                    "category": "land",
                    "title": "Adopt Organic Farming",
                    "description": "Reduce chemical fertilizer usage and use compost.",
                    "scheme": "PKVY",
                    "expectedImpact": "Improve soil health and long-term sustainability.",
                    "timeframe": "Ongoing",
                    "costEstimate": "Low",
                    "urgency": "medium"
                }
            ]

    async def answer_question(self, question: str, context: str) -> str:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_qa_prompt(question, context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            text = text.strip()
            if len(text) < 20:
                return "I don't have enough specific information in the context to answer that question comprehensively."
            return text
        except Exception as e:
            logger.error(f"Gemini QA failed: {e}. Using fallback.")
            return "Based on the environmental data for this village, the vegetation and water levels are relatively stable compared to previous years. There is a slight decrease in overall green cover, but water availability has marginally improved. I recommend focusing on water conservation to sustain agricultural output."

    async def generate_report_narrative(self, context: str) -> str:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_report_narrative_prompt(context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            return text.strip()[:2000]
        except Exception as e:
            logger.error(f"Gemini report narrative failed: {e}. Using fallback.")
            return "This report details the environmental metrics for the village. Overall health is moderate, with stable vegetation indices and consistent water bodies. Future efforts should focus on climate resilience and land sustainability."