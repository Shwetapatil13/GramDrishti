import time
from typing import Dict, Any, Optional

class TTLCache:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Dict]:
        entry = self._cache.get(key)
        if not entry:
            return None
        if time.time() > entry['expires_at']:
            del self._cache[key]
            return None
        return entry['value']

    def set(self, key: str, value: Dict, ttl_seconds: int = 86400) -> None:
        self._cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl_seconds
        }

    def invalidate(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]

    def build_key(self, village_id: str, year: int, dataset: str) -> str:
        return f"{village_id}_{year}_{dataset}"

cache = TTLCache()