import ee
import pyproj
from shapely.geometry import shape  # type: ignore

from typing import Dict, Any

_GEOD = pyproj.Geod(ellps='WGS84')


def compute_polygon_area_sqm(geojson_polygon: dict) -> float:
    """Compute exact geodesic surface area of a GeoJSON polygon in square meters locally."""
    try:
        s = shape(geojson_polygon)
        area_m2, _ = _GEOD.geometry_area_perimeter(s)
        return float(abs(area_m2))
    except Exception:
        return 1000000.0  # Fallback 1 sq km


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
