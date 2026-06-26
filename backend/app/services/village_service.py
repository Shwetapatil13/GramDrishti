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

# Default mock villages to ensure demo_setup.py and initial load works without searching
MOCK_VILLAGES_DATA = [
    {
        "id": "mulshi",
        "name": "Mulshi",
        "nameHindi": "मुळशी",
        "district": "Pune",
        "state": "Maharashtra",
        "coordinates": [18.5204, 73.5297],
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[73.48, 18.48], [73.58, 18.48], [73.58, 18.56], [73.48, 18.56], [73.48, 18.48]]]
        },
        "area": 50.5
    },
    {
        "id": "maval",
        "name": "Maval",
        "nameHindi": "मावळ",
        "district": "Pune",
        "state": "Maharashtra",
        "coordinates": [18.7667, 73.5833],
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[73.53, 18.72], [73.63, 18.72], [73.63, 18.81], [73.53, 18.81], [73.53, 18.72]]]
        },
        "area": 60.2
    },
    {
        "id": "ambegaon",
        "name": "Ambegaon",
        "nameHindi": "आंबेगाव",
        "district": "Pune",
        "state": "Maharashtra",
        "coordinates": [19.1167, 73.7167],
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[73.66, 19.06], [73.76, 19.06], [73.76, 19.16], [73.66, 19.16], [73.66, 19.06]]]
        },
        "area": 45.3
    },
    {
        "id": "khed",
        "name": "Khed",
        "nameHindi": "खेड",
        "district": "Pune",
        "state": "Maharashtra",
        "coordinates": [18.8333, 73.8667],
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[73.81, 18.78], [73.91, 18.78], [73.91, 18.88], [73.81, 18.88], [73.81, 18.78]]]
        },
        "area": 55.0
    },
    {
        "id": "junnar",
        "name": "Junnar",
        "nameHindi": "जुन्नर",
        "district": "Pune",
        "state": "Maharashtra",
        "coordinates": [19.2000, 73.8833],
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[73.83, 19.15], [73.93, 19.15], [73.93, 19.25], [73.83, 19.25], [73.83, 19.15]]]
        },
        "area": 70.1
    }
]

# We'll store searched villages in memory for fast retrieval of boundaries later by ID
SEARCH_CACHE: Dict[str, Village] = {v["id"]: Village(**v) for v in MOCK_VILLAGES_DATA}

def get_village_by_id(village_id: str) -> Optional[Village]:
    """Return a specific village by ID."""
    return SEARCH_CACHE.get(village_id)

def get_village_boundary(village_id: str) -> Optional[Dict[str, Any]]:
    """Return the GeoJSON boundary for a specific village."""
    village = get_village_by_id(village_id)
    if village:
        return village.boundary
    return None