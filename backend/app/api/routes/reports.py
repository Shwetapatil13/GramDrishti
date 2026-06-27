from fastapi import APIRouter, HTTPException, Query, Response, Request
from fastapi.responses import Response as FastAPIResponse
from app.services.village_service import get_village_by_id
from app.api.routes.satellite import get_village_metrics
from app.api.routes.scores import get_village_score
from app.api.routes.recommendations import get_village_recommendations
from app.api.routes.history import get_village_history
from app.api.routes.ai import get_report_narrative
from app.services.reports.pdf_generator import VillageReportGenerator
from app.services.reports.json_exporter import export_village_json
from app.services.reports.csv_exporter import export_historical_csv

router = APIRouter()
pdf_generator = VillageReportGenerator()


@router.get("/reports/{village_id}/pdf")
async def download_pdf(
    request: Request,
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026),
    include_ai: bool = Query(True)
):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    try:
        metrics = await get_village_metrics(village_id, year)
        score = await get_village_score(village_id, year)
        recommendations = []
        ai_narrative = ""

        if include_ai:
            recommendations = await get_village_recommendations(village_id, year)
            ai_narrative_resp = await get_report_narrative(request, village_id, year)
            if isinstance(ai_narrative_resp, dict):
                ai_narrative = ai_narrative_resp.get("narrative", "")

        pdf_bytes = pdf_generator.generate_pdf(
            village=village,
            metrics=metrics,
            score=score,
            recommendations=recommendations,
            ai_narrative=ai_narrative,
            year=year,
            include_ai=include_ai
        )

        headers = {
            "Content-Disposition": f"attachment; filename=GramDrishti_Report_{village_id}_{year}.pdf"
        }
        return FastAPIResponse(
            content=pdf_bytes,
            media_type="application/pdf",
            headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{village_id}/json")
async def download_json(
    request: Request,
    village_id: str,
    year: int = Query(2024, ge=2022, le=2026)
):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    try:
        metrics = await get_village_metrics(village_id, year)
        score = await get_village_score(village_id, year)
        recommendations = await get_village_recommendations(village_id, year)
        history = await get_village_history(village_id)

        json_str = export_village_json(
            village, metrics, score, recommendations, history)

        headers = {
            "Content-Disposition": f"attachment; filename=GramDrishti_Data_{village_id}_{year}.json"
        }
        return FastAPIResponse(
            content=json_str,
            media_type="application/json",
            headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{village_id}/csv")
async def download_csv(
    village_id: str
):
    village = get_village_by_id(village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    try:
        history = await get_village_history(village_id)
        csv_str = export_historical_csv(history)

        headers = {
            "Content-Disposition": f"attachment; filename=GramDrishti_History_{village_id}.csv"
        }
        return FastAPIResponse(
            content=csv_str,
            media_type="text/csv",
            headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
