import time
from typing import Dict, Any, Optional
import collections

# Configurable TTLs (in seconds)
CACHE_TTLS = {
    "village": 30 * 24 * 3600,  # 30 Days
    "weather": 30 * 60,         # 30 Minutes
    "satellite": 24 * 3600,     # 24 Hours
    "tiles": 3600,              # 1 Hour
    "farm": 30 * 24 * 3600,     # 30 Days
    "ai": 10 * 60               # 10 Minutes
}

class SmartCache:
    def __init__(self, max_size=2000):
        # We use an OrderedDict to easily implement an LRU cache eviction
        self._cache: collections.OrderedDict = collections.OrderedDict()
        self.max_size = max_size

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
            
        if time.time() > entry['expires_at']:
            # Evict expired
            del self._cache[key]
            return None
            
        # Move to end (mark as recently used)
        self._cache.move_to_end(key)
        return entry['value']

    def set(self, key: str, value: Any, ttl_seconds: int = None, category: str = "satellite") -> None:
        if ttl_seconds is None:
            ttl_seconds = CACHE_TTLS.get(category, 3600)
        
        # Enforce size limit via LRU eviction
        if key not in self._cache and len(self._cache) >= self.max_size:
            # Pop the oldest item (FIFO/LRU hybrid)
            self._cache.popitem(last=False)
            
        self._cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl_seconds
        }
        self._cache.move_to_end(key)

    def invalidate(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]

    def build_key(
            self,
            village_id: str,
            year: int,
            dataset: str,
            language: Optional[str] = None) -> str:
        base = f"{village_id}_{year}_{dataset}"
        return f"{base}_{language}" if language else base


# Global singleton
cache = SmartCache()
