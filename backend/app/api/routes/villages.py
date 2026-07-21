from fastapi import APIRouter, HTTPException, Query
from typing import List, Any, Dict, Optional
from pydantic import BaseModel
from app.models.village import Village
from app.services import village_service

router = APIRouter()


class RegisterVillageRequest(BaseModel):
    """Payload to temporarily register an externally-resolved village (e.g. from Nominatim)."""
    id: str
    name: str
    nameHindi: str = ""
    district: str = ""
    state: str = "India"
    coordinates: tuple[float, float]
    boundary: Dict[str, Any]
    area: float = 50.0


@router.post("/villages/register", status_code=200)
async def register_village(payload: RegisterVillageRequest):
    """
    Temporarily register a village resolved by the frontend (e.g. from Nominatim / OSM).
    """
    # Simple Geometry validation to prevent massive polygons
    geom = payload.boundary
    import json
    if len(json.dumps(geom)) > 500000:  # 500KB max geometry
        raise HTTPException(status_code=413, detail="Geometry payload too large")
        
    village = Village(
        id=payload.id,
        name=payload.name,
        nameHindi=payload.nameHindi or payload.name,
        district=payload.district,
        state=payload.state,
        coordinates=payload.coordinates,
        boundary=payload.boundary,
        area=payload.area,
    )
    village_service.logger.info(f"[INSTRUMENT 6 - Backend Register] ENTRY registering village_id={payload.id}")
    village_service.SEARCH_CACHE[payload.id] = village
    village_service.BOUNDARY_CACHE[payload.id] = payload.boundary

    # Add to search index if not already present
    if not any(
            item["id"] == payload.id for item in village_service.SEARCH_INDEX):
        village_service.SEARCH_INDEX.append({
            "id": payload.id,
            "name": payload.name,
            "district": payload.district,
            "state": payload.state,
        })

    return {"status": "registered", "id": payload.id, "name": payload.name}


@router.get("/villages/search")
async def search_villages(
    q: str = Query(..., max_length=100, pattern=r"^[\w\s,.-]+$", description="Search query (alphanumeric only)")
):
    """Search for villages via local index."""
    # Normalize input
    q = q.strip().lower()
    villages = await village_service.search_villages(q)
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


@router.get("/villages/boundaries/all")
async def get_all_village_boundaries():
    """Get a FeatureCollection of all indexed village boundaries."""
    features = []
    for village_id, boundary in village_service.BOUNDARY_CACHE.items():
        village = village_service.get_village_by_id(village_id)
        if not village:
            continue
        features.append({
            "type": "Feature",
            "properties": {
                "id": village.id,
                "name": village.name,
                "district": village.district,
                "state": village.state
            },
            "geometry": boundary
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }
