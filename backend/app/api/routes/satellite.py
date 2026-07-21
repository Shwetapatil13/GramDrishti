import asyncio
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any, Dict, Optional

# Ongoing requests dictionary for deduplication
_ongoing_requests: Dict[str, asyncio.Task] = {}

async def _deduplicate_task(key: str, coro) -> Any:
    """Ensure that identical concurrent requests only execute once."""
    if key in _ongoing_requests:
        return await _ongoing_requests[key]
    
    task = asyncio.create_task(coro)
    _ongoing_requests[key] = task
    try:
        result = await task
        return result
    finally:
        _ongoing_requests.pop(key, None)

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
from app.services.gee.registry import LAYER_REGISTRY
from app.services.gee.factory import LayerFactory
from app.services.gee.geometry import geojson_to_ee_geometry

router = APIRouter()


class BoundaryTileRequest(BaseModel):
    boundary: Dict[str, Any]  # GeoJSON geometry
    year: Optional[int] = 2024


import logging
_logger = logging.getLogger(__name__)


# =====================================================================
# GENERIC GEOSPATIAL PLATFORM ENDPOINTS  (must be declared BEFORE
# /{village_id}/... routes so FastAPI doesn't treat 'tiles','layers',
# 'statistics' etc. as a village_id path parameter)
# =====================================================================

@router.get("/satellite/diagnostics2")
async def run_diagnostics():
    import ee
    try:
        # Hardcoded ~1km bounding box in Maharashtra to guarantee speed and avoid limits
        boundary = ee.Geometry.Polygon([[[73.5, 18.5], [73.51, 18.5], [73.51, 18.51], [73.5, 18.51], [73.5, 18.5]]])
        
        start_date = "2024-01-01"
        end_date = "2024-12-31"
        
        gd_coll = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                   .filterBounds(boundary)
                   .filterDate(start_date, end_date)
                   .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
        
        def mask_scl(image):
            scl = image.select('SCL')
            mask = ee.Image.constant(1)
            for bad_class in [3, 8, 9, 10]:
                mask = mask.And(scl.neq(bad_class))
            return image.updateMask(mask)
            
        leg_coll = gd_coll.map(mask_scl)
        
        gd_count = gd_coll.size().getInfo()
        leg_count = leg_coll.size().getInfo()
        
        gd_img = gd_coll.median().clip(boundary)
        leg_img = leg_coll.median().clip(boundary)
        
        rgb_vis = {'bands': ['B4', 'B3', 'B2'], 'min': 0, 'max': 3000}
        
        gd_ndvi = gd_img.normalizedDifference(['B8', 'B4']).rename('NDVI')
        leg_ndvi = leg_img.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        reducer = ee.Reducer.minMax().combine(ee.Reducer.mean(), sharedInputs=True).combine(ee.Reducer.stdDev(), sharedInputs=True)
        
        gd_stats = gd_ndvi.reduceRegion(reducer=reducer, geometry=boundary, scale=10, maxPixels=1e9).getInfo()
        leg_stats = leg_ndvi.reduceRegion(reducer=reducer, geometry=boundary, scale=10, maxPixels=1e9).getInfo()
        
        hist_reducer = ee.Reducer.histogram(maxBuckets=20)
        gd_hist = gd_ndvi.reduceRegion(reducer=hist_reducer, geometry=boundary, scale=10, maxPixels=1e9).getInfo()
        leg_hist = leg_ndvi.reduceRegion(reducer=hist_reducer, geometry=boundary, scale=10, maxPixels=1e9).getInfo()
        
        gd_tiff_url = gd_ndvi.getDownloadURL({'name': 'gd_ndvi', 'scale': 50, 'region': boundary})
        leg_tiff_url = leg_ndvi.getDownloadURL({'name': 'leg_ndvi', 'scale': 50, 'region': boundary})
        
        gd_smooth = gd_ndvi.resample('bicubic').focal_mean(15, 'circle', 'meters')
        leg_smooth = leg_ndvi.resample('bicubic').reproject(crs='EPSG:4326', scale=10).focal_mean(2, 'circle', 'pixels')
        
        gd_smooth_stats = gd_smooth.reduceRegion(reducer=reducer, geometry=boundary, scale=10, maxPixels=1e9).getInfo()
        leg_smooth_stats = leg_smooth.reduceRegion(reducer=reducer, geometry=boundary, scale=10, maxPixels=1e9).getInfo()
        
        return {
            "counts": {"gd": gd_count, "legacy": leg_count},
            "stats_raw": {"gd": gd_stats, "legacy": leg_stats},
            "stats_smooth": {"gd": gd_smooth_stats, "legacy": leg_smooth_stats},
            "histograms": {"gd": gd_hist, "legacy": leg_hist},
            "urls": {
                "gd_tiff": gd_tiff_url,
                "leg_tiff": leg_tiff_url
            }
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}
        
# Force reload


@router.get("/satellite/layers")
async def get_all_layers():
    return {"layers": list(LAYER_REGISTRY.values())}




def _resolve_geometry(geom_type: str, geom_id: str):
    if geom_type == "village":
        boundary = get_village_boundary(geom_id)
        if not boundary:
            raise HTTPException(status_code=404, detail=f"Village '{geom_id}' not found")
        try:
            # Handle FeatureCollection and Feature wrappers from Nominatim
            if boundary.get("type") == "FeatureCollection":
                features = boundary.get("features", [])
                if not features:
                    raise HTTPException(status_code=422, detail=f"Village '{geom_id}' has empty FeatureCollection boundary")
                boundary = features[0].get("geometry", {})
            elif boundary.get("type") == "Feature":
                boundary = boundary.get("geometry", {})
            return geojson_to_ee_geometry(boundary)
        except HTTPException:
            raise
        except (ValueError, Exception) as e:
            raise HTTPException(status_code=422, detail=f"Invalid geometry for '{geom_id}': {str(e)}")
    raise HTTPException(status_code=400, detail=f"Unsupported geometry type: {geom_type}")


@router.get("/satellite/tiles")
async def get_generic_tiles(
    layer: str = Query(..., description="Layer ID (e.g., NDVI, SMI)"),
    geometryType: str = Query("village", description="Type of geometry"),
    geometryId: str = Query(..., description="ID of the geometry"),
    start: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end: str = Query(..., description="End date (YYYY-MM-DD)"),
    cloud: int = Query(20, description="Max cloud cover percentage")
):
    """
    Generic endpoint to fetch smooth map tiles for any layer via LayerFactory.
    """
    try:
        geom = _resolve_geometry(geometryType, geometryId)
    except HTTPException:
        raise  # re-raise 404/400 directly, don't swallow as 422
    try:
        import asyncio
        key = f"tiles_{layer}_{geometryType}_{geometryId}_{start}_{end}_{cloud}"
        
        async def fetch_tiles():
            return await asyncio.to_thread(
                LayerFactory.get_tiles, layer, geom, start, end, cloud
            )
            
        tile_data = await _deduplicate_task(key, fetch_tiles())
        return tile_data
    except GEEDataError as e:
        _logger.error("[tiles] GEEDataError for layer=%s village=%s: %s", layer, geometryId, str(e))
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        _logger.exception("[tiles] Unexpected error for layer=%s village=%s", layer, geometryId)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/statistics")
async def get_generic_statistics(
    layer: str = Query(..., description="Layer ID (e.g., NDVI, SMI)"),
    geometryType: str = Query("village", description="Type of geometry"),
    geometryId: str = Query(..., description="ID of the geometry"),
    start: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end: str = Query(..., description="End date (YYYY-MM-DD)"),
    aggregation: str = Query("mean", description="Aggregation mode (mean, median)"),
    cloud: int = Query(20, description="Max cloud cover percentage")
):
    """
    Generic endpoint to compute statistics for any layer via LayerFactory.
    """
    try:
        geom = _resolve_geometry(geometryType, geometryId)
    except HTTPException:
        raise
    try:
        import asyncio
        key = f"stats_{layer}_{geometryType}_{geometryId}_{start}_{end}_{aggregation}_{cloud}"
        
        async def fetch_stats():
            return await asyncio.to_thread(
                LayerFactory.get_statistics, layer, geom, start, end, aggregation, cloud
            )
            
        stats_data = await _deduplicate_task(key, fetch_stats())
        return stats_data
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/value")
async def get_generic_pixel_value(
    layer: str = Query(..., description="Layer ID (e.g., NDVI, SMI)"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    start: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end: str = Query(..., description="End date (YYYY-MM-DD)"),
    cloud: int = Query(20, description="Max cloud cover percentage"),
    geometryId: Optional[str] = Query(None, description="Village ID for computation caching")
):
    """
    Generic endpoint to extract the exact pixel value at a coordinate.
    """
    try:
        import asyncio
        # Round coords slightly to maximize deduplication of very close concurrent hovers
        r_lat, r_lng = round(lat, 4), round(lng, 4)
        key = f"value_{layer}_{geometryId}_{r_lat}_{r_lng}_{start}_{end}_{cloud}"
        
        async def fetch_value():
            return await asyncio.to_thread(
                LayerFactory.get_pixel_value, layer, lat, lng, start, end, cloud, geometryId
            )
            
        value_data = await _deduplicate_task(key, fetch_value())
        # Add basic interpretation based on layer metadata
        layer_meta = LayerFactory.get_layer_metadata(layer)
        value_data["interpretation"] = layer_meta.get("name", "Unknown Layer")
        value_data["latitude"] = lat
        value_data["longitude"] = lng
        
        return value_data
    except GEEDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/compare")
async def compare_layers():
    """Stub for comparison API"""
    return {"status": "not_implemented"}


@router.get("/satellite/export")
async def export_layer(
    layer: str = Query(...),
    format: str = Query("png")
):
    """Stub for export API"""
    from app.services.gee.export_service import ExportService
    return ExportService.export_map(layer, {}, format)


# =====================================================================
# LEGACY / VILLAGE-SPECIFIC ENDPOINTS
# =====================================================================


@router.get("/satellite/regions/metrics")
async def get_all_regions_metrics(
    year: int = Query(2024, ge=2022, le=2026)
):
    """Fetch metrics for all villages in the local search index simultaneously."""
    import asyncio
    from app.utils.cache import cache

    async def fetch_village(v_info):
        vid = v_info["id"]
        
        # Check cache first to avoid launching 7 GEE tasks
        cache_key = cache.build_key(vid, year, "all")
        cached = cache.get(cache_key)
        
        if cached:
            metrics = aggregate_environmental_metrics(vid, year, cached)
            ndvi = metrics.ndvi
        else:
            # Fallback mock for the pie chart if cache miss, to prevent 3 minute UI hangs
            from app.services.gee.processor import MOCK_METRICS
            if vid in MOCK_METRICS and year in MOCK_METRICS[vid]:
                ndvi = MOCK_METRICS[vid][year].get("ndvi", 0.5)
            else:
                ndvi = 0.5
                
        # Determine category for frontend
        cat = "poor"
        if ndvi > 0.6:
            cat = "excellent"
        elif ndvi >= 0.4:
            cat = "good"
        elif ndvi >= 0.2:
            cat = "fair"

        # Fetch village area
        from app.services.village_service import get_village_by_id
        village = get_village_by_id(vid)
        area_ha = village.area if village else 50.0

        return {
            "id": vid,
            "name": v_info["name"],
            "ndvi": ndvi,
            "category": cat,
            "areaHa": area_ha
        }

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
        import asyncio
        key = f"metrics_{village_id}_{year}"
        
        async def fetch_metrics():
            return await get_all_gee_metrics(village_id, boundary, year)
            
        raw_metrics = await _deduplicate_task(key, fetch_metrics())
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
