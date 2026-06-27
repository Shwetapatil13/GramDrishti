from app.core.config import settings
from app.core.logging import get_logger
from app.services.ai.gemini_client import GeminiClient
from app.models.village import EnvironmentalMetrics, VillageHealthScore, Village
from app.services.ai.prompt_builder import build_village_context

logger = get_logger(__name__)

class AIService:
    def __init__(self):
        logger.info("Initializing AI Service with Gemini (gemini-1.5-flash)")
        self.client = GeminiClient()

    def _build_context(self, village: Village, metrics: EnvironmentalMetrics, score: VillageHealthScore, historical_summary: str | None = None, language: str = "en") -> str:
        return build_village_context(village, metrics, score, historical_summary, language)

    async def get_summary(self, village: Village, metrics: EnvironmentalMetrics, score: VillageHealthScore, historical_summary: str | None = None, language: str = "en") -> str:
        context = self._build_context(village, metrics, score, historical_summary, language)
        return await self.client.generate_summary(context)

    async def get_recommendations(self, village: Village, metrics: EnvironmentalMetrics, score: VillageHealthScore, language: str = "en") -> list[dict]:
        context = self._build_context(village, metrics, score, None, language)
        return await self.client.generate_recommendations(context)

    async def chat(self, question: str, village: Village, metrics: EnvironmentalMetrics, score: VillageHealthScore, language: str = "en") -> str:
        context = self._build_context(village, metrics, score, None, language)
        return await self.client.answer_question(question, context)
        
    async def get_report_narrative(self, village: Village, metrics: EnvironmentalMetrics, score: VillageHealthScore, language: str = "en") -> str:
        context = self._build_context(village, metrics, score, None, language)
        return await self.client.generate_report_narrative(context)

# Singleton
ai_service = AIService()