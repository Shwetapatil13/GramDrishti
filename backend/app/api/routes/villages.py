from fastapi import APIRouter, HTTPException, Query
from typing import List, Any, Dict
from app.models.village import Village
from app.services import village_service

router = APIRouter()

@router.get("/villages/search", response_model=List[Village])
async def search_villages(q: str = Query(..., description="Search query")):
    """Search for villages via OpenStreetMap."""
    villages = await village_service.search_osm_village(q)
    # Cache them so get_village_by_id works immediately after
    for v in villages:
        village_service.SEARCH_CACHE[v.id] = v
    return villages

@router.get("/villages/{village_id}", response_model=Village)
async def get_village(village_id: str):
    """Get a single village by ID."""
    village = village_service.get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return village

@router.get("/villages/{village_id}/boundary", response_model=Dict[str, Any])
async def get_village_boundary(village_id: str):
    """Get the GeoJSON boundary of a village."""
    boundary = village_service.get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
    return boundary