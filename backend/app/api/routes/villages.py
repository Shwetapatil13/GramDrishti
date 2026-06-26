from fastapi import APIRouter, HTTPException
from typing import List, Any, Dict
from app.models.village import Village
from app.services import village_service

router = APIRouter()

@router.get("/villages", response_model=List[Village])
def list_villages():
    """Get all villages."""
    return village_service.get_all_villages()

@router.get("/villages/{village_id}", response_model=Village)
def get_village(village_id: str):
    """Get a single village by ID."""
    village = village_service.get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return village

@router.get("/villages/{village_id}/boundary", response_model=Dict[str, Any])
def get_village_boundary(village_id: str):
    """Get the GeoJSON boundary of a village."""
    boundary = village_service.get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
    return boundary