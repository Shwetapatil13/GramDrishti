from fastapi import APIRouter, HTTPException, Query
from app.services.gee.processor import get_all_gee_metrics
from app.services.village_service import get_village_boundary
from app.core.exceptions import GEETimeoutError, GEEDataError
from app.models.satellite import (
    EnvironmentalMetricsResponse, 
    Sentinel2Metrics, 
    LandCoverMetrics, 
    TerrainMetrics, 
    WaterMetrics
)

router = APIRouter()

@router.get("/satellite/{village_id}/metrics", response_model=EnvironmentalMetricsResponse)
async def get_village_metrics(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
        
    try:
        metrics = await get_all_gee_metrics(village_id, boundary, year)
        return {
            "villageId": village_id,
            "year": year,
            "ndvi": metrics.get("ndvi", 0.0),
            "ndwi": metrics.get("ndwi", 0.0),
            "waterAreaHa": metrics.get("water_area_ha", 0.0),
            "greenCoverPercent": metrics.get("green_cover_percent", 0.0),
            "landCover": metrics.get("land_cover", {
                "cropland": 0, "trees": 0, "water": 0, "builtArea": 0,
                "grassland": 0, "bareLand": 0, "flooded": 0
            }),
            "temperature": 0.0,
            "rainfall": 0.0,
            "humidity": 0.0,
            "windSpeed": 0.0,
            "dataSource": metrics.get("dataSource", "live")
        }
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/satellite/{village_id}/ndvi", response_model=Sentinel2Metrics)
async def get_village_ndvi(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
        
    try:
        metrics = await get_all_gee_metrics(village_id, boundary, year)
        # Using mock mapped response or Sentinel response
        sentinel = metrics.get("sentinel")
        if sentinel:
            return sentinel
            
        # Fallback for mock mapping
        return {
            "ndvi_mean": metrics.get("ndvi", 0.0),
            "ndwi_mean": metrics.get("ndwi", 0.0),
            "red_mean": 0.0,
            "nir_mean": 0.0,
            "swir_mean": 0.0
        }
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/satellite/{village_id}/water", response_model=WaterMetrics)
async def get_village_water(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
        
    try:
        metrics = await get_all_gee_metrics(village_id, boundary, year)
        water = metrics.get("water")
        if water:
            return water
            
        return {
            "water_area_ha": metrics.get("water_area_ha", 0.0),
            "water_coverage_percent": 0.0,
            "seasonal_water_months": 0.0,
            "water_occurrence_mean": 0.0
        }
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/satellite/{village_id}/landcover", response_model=LandCoverMetrics)
async def get_village_landcover(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
        
    try:
        metrics = await get_all_gee_metrics(village_id, boundary, year)
        lc = metrics.get("land_cover")
        if lc:
            # Map mock fields to DW classes if coming from mock
            return {
                "water": lc.get("water", 0.0),
                "trees": lc.get("trees", 0.0),
                "grass": lc.get("grassland", lc.get("grass", 0.0)),
                "flooded_vegetation": lc.get("flooded", lc.get("flooded_vegetation", 0.0)),
                "crops": lc.get("cropland", lc.get("crops", 0.0)),
                "shrub_and_scrub": lc.get("shrub_and_scrub", 0.0),
                "built": lc.get("built", lc.get("builtArea", 0.0)),
                "bare": lc.get("bareLand", lc.get("bare", 0.0)),
                "snow_and_ice": lc.get("snow_and_ice", 0.0)
            }
            
        raise GEEDataError("Land cover metrics not found")
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/satellite/{village_id}/terrain", response_model=TerrainMetrics)
async def get_village_terrain(village_id: str):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")
        
    try:
        # Mock terrain for now
        return {
            "mean_elevation_m": 600.0,
            "slope_mean_degrees": 5.0,
            "slope_std_degrees": 2.0,
            "flood_risk_area_percent": 15.0
        }
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))