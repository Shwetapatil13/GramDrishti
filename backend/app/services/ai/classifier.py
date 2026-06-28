import json
from app.core.logging import get_logger
from app.services.ai.gemini_client import GeminiClient

logger = get_logger(__name__)

INTENTS = [
    "agriculture",
    "water",
    "weather",
    "flood",
    "drought",
    "infrastructure",
    "population",
    "disaster",
    "general"
]

class QueryIntentClassifier:
    def __init__(self, gemini_client: GeminiClient):
        self.client = gemini_client

    async def classify(self, question: str) -> list[str]:
        prompt = f"""
        Classify the following user question into one or more of these intents:
        {json.dumps(INTENTS)}
        
        Question: "{question}"
        
        Respond ONLY with a valid JSON array of strings representing the matching intents. 
        If the question doesn't match any specific intent or asks for a summary, return ["general"].
        """
        
        try:
            # We'll use the existing client. This is a lightweight call.
            response = await self.client._generate_content_with_timeout(prompt)
            text = response.strip()
            
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            intents = json.loads(text.strip())
            
            if not isinstance(intents, list):
                return ["general"]
                
            # Filter to known intents
            valid_intents = [i for i in intents if i in INTENTS]
            if not valid_intents:
                return ["general"]
                
            return valid_intents
            
        except Exception as e:
            logger.error(f"Intent classification failed: {e}. Falling back to general.")
            # Fallback keyword matching
            q_lower = question.lower()
            detected = []
            if "crop" in q_lower or "farm" in q_lower or "agricultur" in q_lower:
                detected.append("agriculture")
            if "water" in q_lower or "river" in q_lower or "lake" in q_lower or "irrigation" in q_lower:
                detected.append("water")
            if "rain" in q_lower or "weather" in q_lower or "temperatur" in q_lower:
                detected.append("weather")
            
            if detected:
                return detected
            return ["general"]
