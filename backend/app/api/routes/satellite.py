from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any, Dict, Optional
from app.services.gee.processor import get_all_gee_metrics
from app.services.gee.dynamic_world import get_land_cover_tiles
from app.services.gee.sentinel2 import get_ndvi_tiles
from app.services.gee.water import get_water_tiles
from app.services.village_service import get_village_boundary, SEARCH_INDEX
from app.services.scoring.aggregator import aggregate_environmental_metrics
from app.core.exceptions import GEETimeoutError, GEEDataError
from app.models.satellite import (
    EnvironmentalMetricsResponse,
    Sentinel2Metrics,
    LandCoverMetrics,
    TerrainMetrics,
    WaterMetrics
)
from app.models.village import EnvironmentalMetrics

router = APIRouter()


class BoundaryTileRequest(BaseModel):
    boundary: Dict[str, Any]  # GeoJSON geometry
    year: Optional[int] = 2024


@router.get("/satellite/regions/metrics")
async def get_all_regions_metrics(
    year: int = Query(2024, ge=2022, le=2026)
):
    """Fetch metrics for all villages in the local search index simultaneously."""
    import asyncio

    async def fetch_village(v_info):
        vid = v_info["id"]
        boundary = get_village_boundary(vid)
        if not boundary:
            return None
        try:
            raw = await get_all_gee_metrics(vid, boundary, year)
            metrics = aggregate_environmental_metrics(vid, year, raw)
            # Determine category for frontend
            cat = "poor"
            if metrics.ndvi > 0.6:
                cat = "excellent"
            elif metrics.ndvi >= 0.4:
                cat = "good"
            elif metrics.ndvi >= 0.2:
                cat = "fair"

            # Fetch village area
            from app.services.village_service import get_village_by_id
            village = get_village_by_id(vid)
            area_ha = village.area if village else 50.0

            return {
                "id": vid,
                "name": v_info["name"],
                "ndvi": metrics.ndvi,
                "category": cat,
                "areaHa": area_ha
            }
        except Exception as e:
            import logging
            logging.error(f"Error fetching metrics for {vid}: {e}")
            return None

    tasks = [fetch_village(v) for v in SEARCH_INDEX]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out failures and None
    valid_results = [r for r in results if r and not isinstance(r, Exception)]

    # Return as a dict mapped by ID
    return {r["id"]: r for r in valid_results}


@router.get("/satellite/{village_id}/metrics",
            response_model=EnvironmentalMetrics)
async def get_village_metrics(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")

    try:
        raw_metrics = await get_all_gee_metrics(village_id, boundary, year)
        return aggregate_environmental_metrics(village_id, year, raw_metrics)
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


@router.get("/satellite/{village_id}/landcover",
            response_model=LandCoverMetrics)
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


@router.get("/satellite/{village_id}/landcover/tiles")
async def get_village_landcover_tiles(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(status_code=404, detail="Village not found")

    try:
        # In a production app, we would cache this urlFormat for an hour since Earth Engine tokens expire,
        # but for demonstration we'll fetch it on demand.
        import asyncio
        tile_data = await asyncio.to_thread(get_land_cover_tiles, boundary, year)
        return tile_data
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/{village_id}/ndvi/tiles")
async def get_village_ndvi_tiles(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(
            status_code=404,
            detail="Village not found in local DB — use POST /ndvi/tiles with boundary")

    try:
        import asyncio
        tile_data = await asyncio.to_thread(get_ndvi_tiles, boundary, year)
        return tile_data
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/satellite/ndvi/tiles")
async def post_ndvi_tiles(req: BoundaryTileRequest):
    """Generate NDVI raster tiles from a GeoJSON boundary. Works for any village."""
    year = max(2022, min(2026, req.year or 2024))
    try:
        import asyncio
        tile_data = await asyncio.to_thread(get_ndvi_tiles, req.boundary, year)
        return tile_data
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/{village_id}/water/tiles")
async def get_village_water_tiles(
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026, description="Target year")
):
    boundary = get_village_boundary(village_id)
    if not boundary:
        raise HTTPException(
            status_code=404,
            detail="Village not found in local DB — use POST /water/tiles with boundary")

    try:
        import asyncio
        tile_data = await asyncio.to_thread(get_water_tiles, boundary, year)
        return tile_data
    except GEETimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/satellite/water/tiles")
async def post_water_tiles(req: BoundaryTileRequest):
    """Generate water raster tiles from a GeoJSON boundary. Works for any village."""
    year = max(2022, min(2026, req.year or 2024))
    try:
        import asyncio
        tile_data = await asyncio.to_thread(get_water_tiles, req.boundary, year)
        return tile_data
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
