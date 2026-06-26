import json
import os
import glob
from typing import List, Dict, Any, Optional
from app.models.village import Village
from app.core.logging import get_logger

logger = get_logger(__name__)

# Cache for villages: { "id": Village }
SEARCH_CACHE: Dict[str, Village] = {}
# Cache for village boundaries: { "id": Dict[str, Any] }
BOUNDARY_CACHE: Dict[str, Dict[str, Any]] = {}
# Search index: List of searchable dictionaries without full boundary
SEARCH_INDEX: List[Dict[str, Any]] = []

def load_villages():
    """Load all GeoJSON files from data/ directory and build the index."""
    global SEARCH_CACHE, BOUNDARY_CACHE, SEARCH_INDEX
    SEARCH_CACHE.clear()
    BOUNDARY_CACHE.clear()
    SEARCH_INDEX.clear()
    
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    geojson_files = glob.glob(os.path.join(data_dir, "*.geojson"))
    
    logger.info(f"Loading GeoJSON files from {data_dir}...")
    
    count = 0
    for file_path in geojson_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                features = data.get("features", [])
                
                for feature in features:
                    props = feature.get("properties", {})
                    geom = feature.get("geometry", {})
                    
                    if not geom or geom.get("type") not in ["Polygon", "MultiPolygon"]:
                        continue
                        
                    v_id = str(props.get("id", count))
                    name = props.get("name", "Unknown")
                    district = props.get("district", "Unknown")
                    state = props.get("state", "Unknown")
                    
                    # Calculate approximate center from coordinates for display purposes
                    coords = geom.get("coordinates", [])
                    lat = 20.0
                    lon = 78.0
                    if coords and len(coords) > 0 and len(coords[0]) > 0:
                        # simple average of first few points
                        pts = coords[0]
                        if isinstance(pts[0], list): # Polygon
                            lon = sum([p[0] for p in pts]) / len(pts)
                            lat = sum([p[1] for p in pts]) / len(pts)
                    
                    village = Village(
                        id=v_id,
                        name=name,
                        nameHindi=name,
                        district=district,
                        state=state,
                        coordinates=(lat, lon),
                        boundary=geom,
                        area=50.0  # Mock area
                    )
                    
                    SEARCH_CACHE[v_id] = village
                    BOUNDARY_CACHE[v_id] = geom
                    
                    # Add to search index (without heavy geometry)
                    SEARCH_INDEX.append({
                        "id": v_id,
                        "name": name,
                        "district": district,
                        "state": state
                    })
                    
                    count += 1
        except Exception as e:
            logger.error(f"Failed to load {file_path}: {e}")
            
    logger.info(f"Loaded {count} villages into the index.")

async def search_villages(query: str) -> List[Dict[str, Any]]:
    """Search for villages in the loaded index."""
    query_lower = query.lower()
    results = []
    
    for item in SEARCH_INDEX:
        if (query_lower in item["name"].lower() or 
            query_lower in item["district"].lower() or 
            query_lower in item["state"].lower()):
            results.append(item)
            if len(results) >= 20: # Limit results
                break
                
    return results

def get_village_by_id(village_id: str) -> Optional[Village]:
    """Return a specific village by ID."""
    return SEARCH_CACHE.get(village_id)

def get_village_boundary(village_id: str) -> Optional[Dict[str, Any]]:
    """Return the GeoJSON boundary for a specific village."""
    return BOUNDARY_CACHE.get(village_id)
