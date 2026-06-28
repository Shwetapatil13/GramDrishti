from app.core.config import settings
from app.core.logging import get_logger
from app.services.ai.gemini_client import GeminiClient
from app.services.ai.ollama_client import OllamaClient
from app.services.ai.classifier import QueryIntentClassifier
from app.services.ai.retrieval_engine import RetrievalEngine
from app.models.village import EnvironmentalMetrics, VillageHealthScore, Village
from app.services.ai.prompt_builder import build_village_context, assemble_dynamic_prompt
from app.services.ai.audit import AuditLogger
from app.services.ai.confidence import calculate_confidence
from app.services.ai.processors import agriculture, water, disaster, schemes
from typing import AsyncGenerator, List, Dict, Any
import json

logger = get_logger(__name__)


class AIService:
    def __init__(self, provider: str = "gemini"):
        self.provider = provider
        if provider == "ollama":
            self.client = OllamaClient()
        else:
            self.client = GeminiClient()
            
        self.classifier = QueryIntentClassifier(self.client if provider == "gemini" else GeminiClient())
        self.retrieval_engine = RetrievalEngine()

    def _build_context(
            self,
            village: Village,
            metrics: EnvironmentalMetrics,
            score: VillageHealthScore,
            historical_summary: str | None = None,
            language: str = "en") -> str:
        return build_village_context(
            village, metrics, score, historical_summary, language)

    async def get_summary(
            self,
            village: Village,
            metrics: EnvironmentalMetrics,
            score: VillageHealthScore,
            historical_summary: str | None = None,
            language: str = "en") -> str:
        context = self._build_context(
            village, metrics, score, historical_summary, language)
        return await self.client.generate_summary(context)

    async def get_recommendations(
            self,
            village: Village,
            metrics: EnvironmentalMetrics,
            score: VillageHealthScore,
            language: str = "en") -> list[dict]:
        context = self._build_context(village, metrics, score, None, language)
        return await self.client.generate_recommendations(context)

    async def chat_stream(
            self,
            question: str,
            village_id: str,
            year: int,
            language: str = "en",
            history: List[Dict[str, Any]] = None,
            map_state: Dict[str, Any] = None,
            clicked_location: Dict[str, Any] = None) -> AsyncGenerator[str, None]:
        
        yield json.dumps({"status": "initializing"}) + "\n"
        
        audit = AuditLogger()
        audit.start_session(question, village_id)
        
        # 1. Classify Intent
        intents = await self.classifier.classify(question)
        yield json.dumps({"status": "retrieving", "details": f"Intents: {', '.join(intents)}"}) + "\n"
        
        # 2. Retrieve Modular Context
        context_blocks = await self.retrieval_engine.fetch(
            village_id=village_id,
            year=year,
            intents=intents,
            clicked_location=clicked_location,
            audit=audit
        )
        
        # 3. Calculate Confidence
        confidence_data = calculate_confidence(context_blocks)
        audit.log_confidence(confidence_data)
        context_blocks["confidence"] = confidence_data
        
        yield json.dumps({"status": "processors"}) + "\n"
        
        # 4. Run Deterministic Processors
        processor_outputs = {}
        
        if "agriculture" in intents or "general" in intents:
            processor_outputs["agriculture"] = agriculture.process(context_blocks)
            audit.log_processor("AgricultureProcessor")
            
        if "water" in intents or "general" in intents:
            processor_outputs["water"] = water.process(context_blocks)
            audit.log_processor("WaterProcessor")
            
        if "disaster" in intents or "general" in intents:
            processor_outputs["disaster"] = disaster.process(context_blocks)
            audit.log_processor("DisasterProcessor")
            
        processor_outputs["schemes"] = schemes.process(context_blocks)
        audit.log_processor("SchemeEngine")
        
        structured_json = {
            "retrieved_data": context_blocks,
            "processor_insights": processor_outputs
        }
        
        audit.log_structured_json(structured_json)
        
        yield json.dumps({"status": "llm"}) + "\n"
        
        # 5. Assemble Explainable Prompt
        from app.services.ai.prompt_builder import assemble_dynamic_prompt
        system_context = assemble_dynamic_prompt(
            intents=intents,
            structured_json=structured_json, 
            map_state=map_state, 
            clicked_location=clicked_location, 
            language=language
        )
        
        # 6. Generate Response
        response = await self.client.answer_question_rag(
            question=question, 
            system_context=system_context, 
            history=history
        )
        
        audit.finish_session(system_context, response)
        
        # Add follow up questions dynamically based on domain
        follow_ups = ["Generate a full report"]
        if "agriculture" in intents: follow_ups.extend(["Show NDVI trends", "Compare with last year"])
        elif "water" in intents: follow_ups.extend(["What are the nearest water bodies?", "Is there a drought risk?"])
        else: follow_ups.extend(["What government schemes apply here?", "Show me historical data"])
        
        yield json.dumps({
            "status": "completed",
            "answer": response,
            "structured_data": structured_json,
            "follow_up_questions": follow_ups[:3]
        }) + "\n"

    async def get_report_narrative(
            self,
            village: Village,
            metrics: EnvironmentalMetrics,
            score: VillageHealthScore,
            language: str = "en") -> str:
        context = self._build_context(village, metrics, score, None, language)
        return await self.client.generate_report_narrative(context)


# Singleton
ai_service = AIService()
