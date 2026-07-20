import json
import os
import glob
from typing import List, Dict, Any, Optional
from app.models.village import Village
from app.core.logging import get_logger

logger = get_logger(__name__)

# Cache for villages: { "id": Village }
SEARCH_CACHE: Dict[str, Village] = {}
# Cache for village boundaries: { "id": Dict[str, Any] }
BOUNDARY_CACHE: Dict[str, Dict[str, Any]] = {}
# Search index: List of searchable dictionaries without full boundary
SEARCH_INDEX: List[Dict[str, Any]] = []


def load_villages():
    """Load all GeoJSON files from data/ directory and build the index."""

    SEARCH_CACHE.clear()
    BOUNDARY_CACHE.clear()
    SEARCH_INDEX.clear()

    data_dir = os.path.join(
        os.path.dirname(
            os.path.dirname(
                os.path.dirname(__file__))),
        "data")
    geojson_files = glob.glob(os.path.join(data_dir, "*.geojson"))

    logger.info(f"Loading GeoJSON files from {data_dir}...")

    count = 0
    for file_path in geojson_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                features = data.get("features", [])

                for feature in features:
                    props = feature.get("properties", {})
                    geom = feature.get("geometry", {})

                    if not geom or geom.get("type") not in [
                            "Polygon", "MultiPolygon"]:
                        continue

                    v_id = str(props.get("id", count))
                    name = props.get("name", "Unknown")
                    district = props.get("district", "Unknown")
                    state = props.get("state", "Unknown")

                    # Calculate approximate center from coordinates for display
                    # purposes
                    coords = geom.get("coordinates", [])
                    poly_type = geom.get("type", "Polygon")
                    lat = 20.0
                    lon = 78.0
                    if coords and len(coords) > 0:
                        if poly_type == "MultiPolygon":
                            if len(coords[0]) > 0 and len(coords[0][0]) > 0:
                                pts = coords[0][0]
                                lon = sum([p[0] for p in pts]) / len(pts)
                                lat = sum([p[1] for p in pts]) / len(pts)
                        elif poly_type == "Polygon":
                            if len(coords[0]) > 0:
                                pts = coords[0]
                                lon = sum([p[0] for p in pts]) / len(pts)
                                lat = sum([p[1] for p in pts]) / len(pts)

                    village = Village(
                        id=v_id,
                        name=name,
                        nameHindi=name,
                        district=district,
                        state=state,
                        coordinates=(lat, lon),
                        boundary=geom,
                        area=50.0  # Mock area
                    )

                    SEARCH_CACHE[v_id] = village
                    BOUNDARY_CACHE[v_id] = geom

                    # Add to search index (without heavy geometry)
                    SEARCH_INDEX.append({
                        "id": v_id,
                        "name": name,
                        "district": district,
                        "state": state
                    })

                    count += 1
        except Exception as e:
            logger.error(f"Failed to load {file_path}: {e}")

    logger.info(f"Loaded {count} villages into the index.")


async def search_villages(query: str) -> List[Dict[str, Any]]:
    """Search for villages in the loaded index by name."""
    query_lower = query.lower()
    results = []

    for item in SEARCH_INDEX:
        # Match primarily on name so general state/district matches don't suppress Nominatim
        if query_lower in item["name"].lower():
            results.append(item)
            if len(results) >= 20:  # Limit results
                break

    return results


def get_village_by_id(village_id: str) -> Optional[Village]:
    """Return a specific village by ID."""
    return SEARCH_CACHE.get(village_id)


def get_village_boundary(village_id: str) -> Optional[Dict[str, Any]]:
    """Return the GeoJSON boundary for a specific village."""
    return BOUNDARY_CACHE.get(village_id)


def add_dynamic_village(
        village_id: str, polygon: Dict[str, Any], name: str = None) -> Village:
    """Add a dynamically fetched polygon (e.g. from Nominatim) to the cache."""
    # Calculate approximate center
    lat = 20.0
    lon = 78.0
    coords = polygon.get("coordinates", [])
    poly_type = polygon.get("type", "Polygon")

    if coords and len(coords) > 0:
        if poly_type == "MultiPolygon":
            # For MultiPolygon, coords[0] is a Polygon (list of rings)
            # coords[0][0] is the exterior ring (list of points)
            if len(coords[0]) > 0 and len(coords[0][0]) > 0:
                pts = coords[0][0]
                lon = sum([p[0] for p in pts]) / len(pts)
                lat = sum([p[1] for p in pts]) / len(pts)
        elif poly_type == "Polygon":
            # For Polygon, coords[0] is the exterior ring (list of points)
            if len(coords[0]) > 0:
                pts = coords[0]
                lon = sum([p[0] for p in pts]) / len(pts)
                lat = sum([p[1] for p in pts]) / len(pts)

    village = Village(
        id=village_id,
        name=name or village_id,
        nameHindi=name or village_id,
        district="Dynamic",
        state="Dynamic",
        coordinates=(lat, lon),
        boundary=polygon,
        area=50.0  # Mock area
    )

    SEARCH_CACHE[village_id] = village
    BOUNDARY_CACHE[village_id] = polygon
    return village
