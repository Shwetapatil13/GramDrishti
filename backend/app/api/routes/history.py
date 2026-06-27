from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from app.services.scoring.history import get_historical_data, calculate_change_statistics
from app.models.village import HistoricalData
from app.core.exceptions import VillageNotFoundError

router = APIRouter()


@router.get("/history/{village_id}", response_model=HistoricalData)
async def get_village_history(village_id: str):
    years = [2022, 2023, 2024, 2025, 2026]
    try:
        data = await get_historical_data(village_id, years)
        return data
    except VillageNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{village_id}/changes")
async def get_village_history_changes(village_id: str) -> Dict[str, Any]:
    years = [2022, 2023, 2024, 2025, 2026]
    try:
        data = await get_historical_data(village_id, years)
        stats = calculate_change_statistics(data)
        return stats
    except VillageNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{village_id}/compare")
async def compare_years(
    village_id: str,
    year1: int = Query(2022),
    year2: int = Query(2024)
) -> Dict[str, Any]:
    try:
        data = await get_historical_data(village_id, [year1, year2])
        if len(data.metrics) < 2:
            raise HTTPException(status_code=400,
                                detail="Data unavailable for both years")

        m1 = data.metrics[0]
        m2 = data.metrics[1]

        return {
            "villageId": village_id,
            "year1": year1,
            "year2": year2,
            "ndvi_diff": m2.ndvi -
            m1.ndvi,
            "water_diff_ha": m2.waterAreaHa -
            m1.waterAreaHa,
            "green_cover_diff_percent": m2.greenCoverPercent -
            m1.greenCoverPercent}
    except VillageNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
