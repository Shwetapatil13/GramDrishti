import json
import time
from datetime import datetime
from pathlib import Path
from app.core.logging import get_logger

logger = get_logger(__name__)

# Keep audit logs in a local file for now
AUDIT_LOG_DIR = Path("logs/ai_audits")
AUDIT_LOG_DIR.mkdir(parents=True, exist_ok=True)

class AuditLogger:
    def __init__(self):
        self.current_audit = {}
        
    def start_session(self, query: str, village_id: str):
        self.current_audit = {
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "village_id": village_id,
            "start_time": time.time(),
            "retrieved_datasets": [],
            "executed_processors": [],
            "structured_json_size_bytes": 0,
            "confidence": {}
        }
        
    def log_retrieval(self, dataset_name: str):
        self.current_audit["retrieved_datasets"].append(dataset_name)
        
    def log_processor(self, processor_name: str):
        self.current_audit["executed_processors"].append(processor_name)
        
    def log_structured_json(self, json_data: dict):
        self.current_audit["structured_json_size_bytes"] = len(json.dumps(json_data))
        
    def log_confidence(self, confidence_scores: dict):
        self.current_audit["confidence"] = confidence_scores
        
    def finish_session(self, llm_prompt: str, llm_response: str):
        end_time = time.time()
        self.current_audit["execution_time_seconds"] = round(end_time - self.current_audit["start_time"], 2)
        
        # Don't log full prompt/response in production to save space, but log lengths
        self.current_audit["prompt_length"] = len(llm_prompt)
        self.current_audit["response_length"] = len(llm_response)
        
        log_file = AUDIT_LOG_DIR / f"audit_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
        try:
            with open(log_file, "a") as f:
                f.write(json.dumps(self.current_audit) + "\n")
        except Exception as e:
            logger.error(f"Failed to write audit log: {e}")
