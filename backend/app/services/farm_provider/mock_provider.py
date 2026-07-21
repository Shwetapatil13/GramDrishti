import random
import uuid
import datetime
from typing import Dict, Any
from app.services.farm_provider.provider import FarmProvider
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union

class MockFarmProvider(FarmProvider):
    """
    Generates mock procedural farm polygons constrained exactly inside the given boundary.
    """
    
    async def get_farms_for_village(self, village_id: str, boundary_geojson: Dict[str, Any]) -> Dict[str, Any]:
        if not boundary_geojson:
            return {"type": "FeatureCollection", "features": []}
            
        try:
            # Handle Nominatim Feature/FeatureCollection wrapping
            geom_data = boundary_geojson
            if geom_data.get("type") == "FeatureCollection":
                geom_data = geom_data["features"][0]["geometry"]
            elif geom_data.get("type") == "Feature":
                geom_data = geom_data["geometry"]
                
            village_shape = shape(geom_data)
        except Exception:
            # If shape conversion fails, return empty
            return {"type": "FeatureCollection", "features": []}
            
        # Get bounding box
        minx, miny, maxx, maxy = village_shape.bounds
        
        # We will create a grid of ~0.002 degrees (roughly 200m)
        grid_size = 0.002
        features = []
        
        x = minx
        while x < maxx:
            y = miny
            while y < maxy:
                # Add some randomness to make it look like organic farms
                w = grid_size * random.uniform(0.7, 1.3)
                h = grid_size * random.uniform(0.7, 1.3)
                
                farm_poly = Polygon([
                    (x, y),
                    (x + w, y),
                    (x + w, y + h),
                    (x, y + h),
                    (x, y)
                ])
                
                # Check intersection
                if village_shape.intersects(farm_poly):
                    intersection = village_shape.intersection(farm_poly)
                    
                    # Convert to individual polygons if MultiPolygon
                    polys = []
                    if isinstance(intersection, MultiPolygon):
                        polys = list(intersection.geoms)
                    elif isinstance(intersection, Polygon):
                        polys = [intersection]
                        
                    for p in polys:
                        # Only keep reasonable sized farms (filter out slivers from edge intersection)
                        if p.area > (grid_size * grid_size * 0.1):
                            farm_id = f"AGS-{str(uuid.uuid4())[:8].upper()}"
                            area_ha = (p.area * 111111 * 111111) / 10000  # rough approx for area
                            
                            features.append({
                                "type": "Feature",
                                "geometry": mapping(p),
                                "properties": {
                                    "farm_id": farm_id,
                                    "area_ha": round(area_ha, 2),
                                    "perimeter_m": round(p.length * 111111, 0),
                                    "ndvi": round(random.uniform(0.3, 0.85), 2),
                                    "vegetation": random.choice(["Healthy", "Healthy", "Moderate", "Stress"]),
                                    "water_stress": random.choice(["Low", "Low", "Medium", "High"]),
                                    "crop_type": random.choice(["Wheat", "Sugarcane", "Rice", "Cotton", "Maize"]),
                                    "last_updated": datetime.date.today().isoformat()
                                }
                            })
                y += h
            x += w
            
        return {
            "type": "FeatureCollection",
            "features": features
        }
