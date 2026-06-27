from shapely.geometry import shape  # type: ignore


def validate_geometry(geojson: dict) -> bool:
    try:
        geom = shape(geojson)
        return geom.is_valid and not geom.is_empty
    except Exception:
        return False
