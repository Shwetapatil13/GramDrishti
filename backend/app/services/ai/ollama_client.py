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
            except httpx.HTTPError as e:
                logger.error(f"Ollama connection error: {str(e)}")
                raise RuntimeError(f"Fallback AI unavailable. Please ensure Ollama is running at {self.base_url} with model {self.model}.")

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
            items = json.loads(text.strip())
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