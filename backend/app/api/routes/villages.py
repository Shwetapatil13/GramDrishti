from fastapi import APIRouter
from typing import List
from app.models.village import Village

router = APIRouter()

# Placeholder for Level 1 returning 5 villages
MOCK_VILLAGES = [
    {
        "id": "mulshi",
        "name": "Mulshi",
        "nameHindi": "मुळशी",
        "district": "Pune",
        "state": "Maharashtra",
        "coordinates": [18.5204, 73.5297],
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[73.5, 18.5], [73.6, 18.5], [73.6, 18.6], [73.5, 18.6], [73.5, 18.5]]]
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
            "coordinates": [[[73.55, 18.75], [73.65, 18.75], [73.65, 18.8], [73.55, 18.8], [73.55, 18.75]]]
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
            "coordinates": [[[73.7, 19.1], [73.8, 19.1], [73.8, 19.2], [73.7, 19.2], [73.7, 19.1]]]
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
            "coordinates": [[[73.8, 18.8], [73.9, 18.8], [73.9, 18.9], [73.8, 18.9], [73.8, 18.8]]]
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
            "coordinates": [[[73.85, 19.15], [73.95, 19.15], [73.95, 19.25], [73.85, 19.25], [73.85, 19.15]]]
        },
        "area": 70.1
    }
]

@router.get("/villages", response_model=List[Village])
def get_villages():
    return MOCK_VILLAGES