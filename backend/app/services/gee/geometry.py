"""
GeoJSON ↔ Earth Engine geometry conversion utilities.
"""
import ee
from shapely.geometry import shape  # type: ignore

from typing import Dict, Any

def geojson_to_ee_geometry(geojson_polygon: dict) -> ee.Geometry:
    """Convert a GeoJSON Polygon dict to ee.Geometry.Polygon."""
    # Ensure it's a valid type
    if geojson_polygon.get("type") != "Polygon":
        raise ValueError("Only Polygon GeoJSON is supported")
        
    coords = geojson_polygon.get("coordinates")
    if not coords or not isinstance(coords, list):
        raise ValueError("Invalid coordinates in GeoJSON")
        
    return ee.Geometry.Polygon(coords)

def ee_geometry_to_geojson(ee_geometry: ee.Geometry) -> Dict[str, Any]:
    """Convert ee.Geometry back to GeoJSON for storage/caching."""
    result = ee_geometry.getInfo()
    return result if result is not None else {}

def validate_geometry(geojson: dict) -> bool:
    """Validate that a GeoJSON polygon is well-formed and non-self-intersecting."""
    try:
        geom = shape(geojson)
        return geom.is_valid and not geom.is_empty
    except Exception:
        return False