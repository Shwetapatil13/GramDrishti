import asyncio
import httpx
import json
import os

villages_to_fetch = [
    {"id": "mulshi", "name": "Mulshi", "district": "Pune"},
    {"id": "maval", "name": "Maval", "district": "Pune"},
    {"id": "ambegaon", "name": "Ambegaon", "district": "Pune"},
    {"id": "khed", "name": "Khed", "district": "Pune"},
    {"id": "junnar", "name": "Junnar", "district": "Pune"},
    {"id": "kolhapur", "name": "Kolhapur", "district": "Kolhapur"},
    {"id": "shirur", "name": "Shirur", "district": "Pune"}
]

async def fetch_real_boundaries():
    features = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        for v in villages_to_fetch:
            # Let's search broadly first
            query = f"{v['name']}, Maharashtra, India"
            print(f"Fetching {query}...")
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": query,
                "format": "geojson",
                "polygon_geojson": 1,
                "limit": 5
            }
            headers = {"User-Agent": "GramDrishti-Audit/1.0"}
            response = await client.get(url, params=params, headers=headers)
            data = response.json()
            
            found_poly = False
            for f in data.get("features", []):
                geom = f.get("geometry")
                if geom and geom["type"] in ["Polygon", "MultiPolygon"]:
                    feature = {
                        "type": "Feature",
                        "properties": {
                            "id": v["id"],
                            "name": v["name"],
                            "district": v["district"],
                            "state": "Maharashtra"
                        },
                        "geometry": geom
                    }
                    features.append(feature)
                    found_poly = True
                    print(f"Success for {v['name']}")
                    break
                    
            if not found_poly:
                print(f"No polygon found for {v['name']}")
            await asyncio.sleep(1) # rate limit

    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    
    os.makedirs("backend/data", exist_ok=True)
    with open("backend/data/maharashtra.geojson", "w") as f:
        json.dump(feature_collection, f)
    print("Saved backend/data/maharashtra.geojson")

if __name__ == "__main__":
    asyncio.run(fetch_real_boundaries())