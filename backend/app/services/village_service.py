import httpx
from typing import List, Dict, Any, Optional
from app.models.village import Village
from app.core.logging import get_logger

logger = get_logger(__name__)

async def search_osm_village(query: str) -> List[Village]:
    """
    Search OpenStreetMap via Nominatim for village boundaries.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params: dict[str, str | int] = {
        "q": query + ", India", # Force India context
        "format": "geojson",
        "polygon_geojson": 1,
        "limit": 5
    }
    headers = {
        "User-Agent": "GramDrishti/1.0 (Contact: local-dev@example.com)"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            villages = []
            features = data.get("features", [])
            for f in features:
                props = f.get("properties", {})
                geom = f.get("geometry", {})
                
                # We need polygons for GEE
                if not geom or geom.get("type") not in ["Polygon", "MultiPolygon"]:
                    continue
                    
                display_name = props.get("display_name", "")
                parts = [p.strip() for p in display_name.split(",")]
                
                name = parts[0] if parts else "Unknown"
                district = parts[1] if len(parts) > 1 else "Unknown"
                state = parts[2] if len(parts) > 2 else "Unknown"
                
                # Approximate area if not provided (Nominatim doesn't provide area easily, 
                # we just mock it to 50 for the UI since GEE handles actual pixel areas)
                
                # Get center coordinates from bounding box if available, otherwise just use a point inside
                bbox = f.get("bbox", [0, 0, 0, 0])
                lat = (bbox[1] + bbox[3]) / 2 if bbox else 20.0
                lon = (bbox[0] + bbox[2]) / 2 if bbox else 78.0
                
                villages.append(Village(
                    id=str(props.get("place_id", name.lower())),
                    name=name,
                    nameHindi=name, # Nominatim doesn't always give Hindi, default to same
                    district=district,
                    state=state,
                    coordinates=(lat, lon),
                    boundary=geom,
                    area=50.0 # Mocked area for display
                ))
            
            return villages
            
    except Exception as e:
        logger.error(f"OSM Search failed: {e}")
        return []

# We'll store searched villages in memory for fast retrieval of boundaries later by ID
SEARCH_CACHE: Dict[str, Village] = {}

def get_village_by_id(village_id: str) -> Optional[Village]:
    """Return a specific village by ID."""
    return SEARCH_CACHE.get(village_id)

def get_village_boundary(village_id: str) -> Optional[Dict[str, Any]]:
    """Return the GeoJSON boundary for a specific village."""
    village = get_village_by_id(village_id)
    if village:
        return village.boundary
    return None