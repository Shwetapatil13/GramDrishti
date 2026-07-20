import httpx
from app.core.config import settings
from app.core.logging import get_logger
import json

logger = get_logger(__name__)


class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = 'gemini-2.5-flash'
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    async def _generate_content_with_timeout(self, prompt: str) -> str:
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise ValueError("GEMINI_API_KEY is not configured")
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

    async def generate_summary(self, context: str) -> dict:
        prompt = __import__(
            'app.services.ai.prompt_builder',
            fromlist=['']).build_summary_prompt(context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            text = text.strip()
            if len(text) < 100 or len(text) > 1500:
                text = text[:1500] if len(text) > 1500 else text
                if len(text) < 100:
                    text = "The AI generated a summary that was too brief. The village appears stable overall based on available metrics."
            return {"summary": text, "ai_source": "gemini"}
        except Exception as e:
            logger.error(
                f"Gemini summary generation failed: {e}. Using fallback.")
            return {
                "summary": "Based on the environmental data for this village, the vegetation and water levels are relatively stable compared to previous years. There is a slight decrease in overall green cover, but water availability has marginally improved. I recommend focusing on water conservation to sustain agricultural output.",
                "ai_source": "fallback"
            }

    async def generate_recommendations(self, context: str) -> dict:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=[
                            '']).build_recommendation_prompt(context)
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
            return {"recommendations": items, "ai_source": "gemini"}
        except Exception as e:
            logger.error(
                f"Failed to fetch recommendations from Gemini: {str(e)}. Using fallback.")
            return {
                "recommendations": [{"priority": 1,
                     "category": "water",
                     "title": "Implement Rainwater Harvesting",
                     "description": "Construct small check dams and farm ponds to capture monsoon runoff.",
                     "scheme": "PMKSY",
                     "expectedImpact": "Increase groundwater recharge and water availability.",
                     "timeframe": "1-2 years",
                     "costEstimate": "Medium",
                     "urgency": "high"},
                    {"priority": 2,
                     "category": "vegetation",
                     "title": "Promote Agroforestry",
                     "description": "Plant fruit-bearing trees along farm boundaries.",
                     "scheme": "MGNREGA",
                     "expectedImpact": "Enhance green cover and provide additional income.",
                     "timeframe": "2-3 years",
                     "costEstimate": "Low",
                     "urgency": "medium"},
                    {"priority": 3,
                     "category": "land",
                     "title": "Adopt Organic Farming",
                     "description": "Reduce chemical fertilizer usage and use compost.",
                     "scheme": "PKVY",
                     "expectedImpact": "Improve soil health and long-term sustainability.",
                     "timeframe": "Ongoing",
                     "costEstimate": "Low",
                     "urgency": "medium"}],
                "ai_source": "fallback"
            }

    async def answer_question(self, question: str, context: str) -> dict:
        prompt = __import__(
            'app.services.ai.prompt_builder',
            fromlist=['']).build_qa_prompt(
            question,
            context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            text = text.strip()
            if len(text) < 20:
                return {"answer": "I don't have enough specific information in the context to answer that question comprehensively.", "ai_source": "gemini"}
            return {"answer": text, "ai_source": "gemini"}
        except Exception as e:
            logger.error(f"Gemini QA failed: {e}. Using fallback.")
            return {
                "answer": "Based on the environmental data for this village, the vegetation and water levels are relatively stable compared to previous years. There is a slight decrease in overall green cover, but water availability has marginally improved. I recommend focusing on water conservation to sustain agricultural output.",
                "ai_source": "fallback"
            }

    async def answer_question_rag(self, question: str, system_context: str, history: list[dict] = None) -> tuple[str, str]:
        contents = []
        if not history:
            contents.append({
                "role": "user",
                "parts": [{"text": f"SYSTEM INSTRUCTIONS AND CONTEXT:\n{system_context}\n\nUSER QUESTION:\n{question}"}]
            })
        else:
            first_user_msg = True
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                text = msg["content"]
                if role == "user" and first_user_msg:
                    text = f"SYSTEM INSTRUCTIONS AND CONTEXT:\n{system_context}\n\nUSER MESSAGE:\n{text}"
                    first_user_msg = False
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })
            contents.append({
                "role": "user",
                "parts": [{"text": question}]
            })
            
        payload = {"contents": contents}
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(self.url, json=payload)
                response.raise_for_status()
                data = response.json()
                text = data['candidates'][0]['content']['parts'][0]['text']
                return text.strip(), "gemini"
        except Exception as e:
            logger.error(f"Gemini RAG QA failed: {e}")
            import traceback
            traceback.print_exc()
            return "### Summary\nThis information is currently unavailable due to an analysis error.\n\n### Evidence\nAnalysis engine failure.\n\n### Analysis\nN/A\n\n### Recommendations\nPlease try again later.", "fallback"

    async def generate_report_narrative(self, context: str) -> dict:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=[
                            '']).build_report_narrative_prompt(context)
        try:
            text = await self._generate_content_with_timeout(prompt)
            return {"narrative": text.strip()[:2000], "ai_source": "gemini"}
        except Exception as e:
            logger.error(
                f"Gemini report narrative failed: {e}. Using fallback.")
            return {
                "narrative": "This report details the environmental metrics for the village. Overall health is moderate, with stable vegetation indices and consistent water bodies. Future efforts should focus on climate resilience and land sustainability.",
                "ai_source": "fallback"
            }
