from fastapi import APIRouter, HTTPException
from app.services.farm_provider.factory import FarmProviderFactory
from app.services.village_service import get_village_boundary

router = APIRouter()

@router.get("/villages/{village_id}/farms")
async def get_village_farms(village_id: str):
    """
    Retrieves the farm field boundaries for a given village.
    """
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village boundary not found")
        
    try:
        farm_provider = FarmProviderFactory.get_provider()
        farms_geojson = await farm_provider.get_farms_for_village(village_id, boundary)
        return farms_geojson
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching farm boundaries: {str(e)}")
