"""
GeoJSON ↔ Earth Engine geometry conversion utilities.
"""
import ee
from shapely.geometry import shape  # type: ignore

from typing import Dict, Any


def geojson_to_ee_geometry(geojson_polygon: dict) -> ee.Geometry:
    """Convert a GeoJSON Polygon or MultiPolygon dict to ee.Geometry."""
    geom_type = geojson_polygon.get("type")
    if geom_type not in ["Polygon", "MultiPolygon"]:
        raise ValueError("Only Polygon and MultiPolygon GeoJSON are supported")

    coords = geojson_polygon.get("coordinates")
    if not coords or not isinstance(coords, list):
        raise ValueError("Invalid coordinates in GeoJSON")

    if geom_type == "MultiPolygon":
        return ee.Geometry.MultiPolygon(coords)
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
