"""
Pre-warms the GEE cache for all 5 demo villages and all 5 years.
Run this before the hackathon demo to ensure < 2s load times.
"""
import asyncio
import httpx

VILLAGES = ["mulshi", "maval", "ambegaon", "khed", "junnar"]
YEARS = [2022, 2023, 2024, 2025, 2026]

async def warm_cache():
    async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=60.0) as client:
        for village in VILLAGES:
            for year in YEARS:
                print(f"Warming {village} {year}...")
                try:
                    await client.get(f"/api/v1/satellite/{village}/metrics?year={year}")
                    await client.get(f"/api/v1/scores/{village}?year={year}")
                    await client.post(f"/api/v1/ai/{village}/summary?year={year}")
                    await client.post(f"/api/v1/ai/{village}/recommendations?year={year}")
                    print(f"  ✓ {village} {year} cached")
                except Exception as e:
                    print(f"  X Failed for {village} {year}: {e}")

if __name__ == "__main__":
    asyncio.run(warm_cache())