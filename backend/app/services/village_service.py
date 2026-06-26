from typing import List, Optional, Dict, Any
from app.models.village import Village

# Using approximate polygons around the central coordinates
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

def get_all_villages() -> List[Village]:
    """Return a list of all villages."""
    return [Village(**v) for v in MOCK_VILLAGES_DATA]

def get_village_by_id(village_id: str) -> Optional[Village]:
    """Return a specific village by ID."""
    for v in MOCK_VILLAGES_DATA:
        if v["id"] == village_id:
            return Village(**v)
    return None

def get_village_boundary(village_id: str) -> Optional[Dict[str, Any]]:
    """Return the GeoJSON boundary for a specific village."""
    village = get_village_by_id(village_id)
    if village:
        return village.boundary
    return None