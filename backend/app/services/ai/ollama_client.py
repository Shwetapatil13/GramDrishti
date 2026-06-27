import httpx
import json
from app.core.logging import get_logger

logger = get_logger(__name__)

class OllamaClient:
    def __init__(self):
        self.base_url = "http://localhost:11434/api/generate"
        self.model = "qwen2.5"

    async def _generate(self, prompt: str, json_format: bool = False) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        if json_format:
            payload["format"] = "json"
            
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(self.base_url, json=payload)
                response.raise_for_status()
                return response.json().get("response", "")
            except Exception as e:
                logger.error(f"Ollama connection error: {str(e)}. Using mock AI response.")
                # Return a mock response if Ollama is unavailable
                if json_format:
                    return json.dumps([
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
                    ])
                
                if "executive summary" in prompt.lower():
                    return "The village shows a stable environmental trend overall. Water availability has improved slightly due to recent conservation efforts, and vegetation cover remains consistent. However, localized areas still face challenges with soil degradation. Continued focus on sustainable agricultural practices is recommended."
                
                if "narrative report" in prompt.lower():
                    return "This report details the environmental metrics for the village. Overall health is moderate, with stable vegetation indices and consistent water bodies. Future efforts should focus on climate resilience and land sustainability."
                
                return "Based on the environmental data for this village, the vegetation and water levels are relatively stable compared to previous years. There is a slight decrease in overall green cover, but water availability has marginally improved. I recommend focusing on water conservation to sustain agricultural output."

    async def generate_summary(self, context: str) -> str:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_summary_prompt(context)
        text = await self._generate(prompt)
        text = text.strip()
        if len(text) < 100 or len(text) > 1500:
            text = text[:1500] if len(text) > 1500 else text
            if len(text) < 100:
                text = "The AI generated a summary that was too brief. The village appears stable overall based on available metrics."
        return text

    async def generate_recommendations(self, context: str) -> list[dict]:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_recommendation_prompt(context)
        text = await self._generate(prompt, json_format=True)
        try:
            clean_text = text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            items = json.loads(clean_text)
            if not isinstance(items, list) or len(items) != 3:
                raise ValueError("Must return exactly 3 items")
            return items
        except Exception as e:
            logger.error(f"Failed to parse recommendations JSON from Ollama: {str(e)}")
            raise ValueError("AI returned invalid format.")

    async def answer_question(self, question: str, context: str) -> str:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_qa_prompt(question, context)
        text = await self._generate(prompt)
        text = text.strip()
        if len(text) < 20:
            return "I don't have enough specific information in the context to answer that question comprehensively."
        return text

    async def generate_report_narrative(self, context: str) -> str:
        prompt = __import__('app.services.ai.prompt_builder', fromlist=['']).build_report_narrative_prompt(context)
        text = await self._generate(prompt)
        return text.strip()[:2000]