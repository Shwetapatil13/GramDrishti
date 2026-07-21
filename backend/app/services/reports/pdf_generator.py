import io
import re
import datetime
import xml.sax.saxutils as saxutils
from reportlab.lib.pagesizes import A4  # type: ignore
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer, TableStyle  # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from reportlab.lib import colors  # type: ignore
from app.models.village import Village, EnvironmentalMetrics, VillageHealthScore, HistoricalData
from app.models.recommendations import AIRecommendationModel


def sanitize_text_for_pdf(text: str | None) -> str:
    """
    Sanitizes raw AI/user-generated text so it can safely be passed to ReportLab Paragraph.
    Escapes XML special characters (&, <, >) and converts standard Markdown elements
    to ReportLab-compatible HTML tags (<b>, <i>, <br/>, bullets).
    """
    if not text:
        return ""
    
    # 1. Escape XML characters (&, <, >)
    escaped = saxutils.escape(str(text))
    
    # 2. Convert markdown bold **text** or __text__ -> <b>text</b>
    escaped = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', escaped)
    escaped = re.sub(r'__(.*?)__', r'<b>\1</b>', escaped)
    
    # 3. Convert markdown italic *text* or _text_ -> <i>text</i>
    escaped = re.sub(r'\*(.*?)\*', r'<i>\1</i>', escaped)
    escaped = re.sub(r'_(.*?)_', r'<i>\1</i>', escaped)
    
    # 4. Handle headers #, ##, ### at line starts -> <b>heading</b>
    escaped = re.sub(r'(?m)^#{1,6}\s*(.*)$', r'<b>\1</b>', escaped)
    
    # 5. Convert bullet points at start of line -> •
    escaped = re.sub(r'(?m)^[\s]*[-+*]\s+', '• ', escaped)
    
    # 6. Convert newlines to <br/>
    escaped = escaped.replace('\n', '<br/>')
    
    return escaped


class VillageReportGenerator:
    def generate_pdf(
        self,
        village: Village,
        metrics: EnvironmentalMetrics,
        score: VillageHealthScore,
        recommendations: list[AIRecommendationModel],
        ai_narrative: str,
        year: int,
        include_ai: bool = True,
        history: HistoricalData | None = None
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50
        )

        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        title_style.alignment = 1  # Center
        heading_style = styles['Heading2']
        normal_style = styles['Normal']

        story = []

        v_name = sanitize_text_for_pdf(village.name)
        v_name_hindi = sanitize_text_for_pdf(village.nameHindi)
        v_district = sanitize_text_for_pdf(village.district)
        v_state = sanitize_text_for_pdf(village.state)

        # 1. Cover
        story.append(
            Paragraph(
                "GramDrishti Environmental Health Report",
                title_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            f"<b>Village:</b> {v_name} ({v_name_hindi})", normal_style))
        story.append(Paragraph(
            f"<b>District:</b> {v_district}, {v_state}", normal_style))
        story.append(Paragraph(f"<b>Analysis Year:</b> {year}", normal_style))
        story.append(
            Paragraph(
                f"<b>Generated On:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
                normal_style))
        story.append(Spacer(1, 30))

        # 2. Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        if include_ai and ai_narrative:
            clean_narrative = sanitize_text_for_pdf(ai_narrative)
            story.append(Paragraph(clean_narrative, normal_style))
        else:
            story.append(
                Paragraph(
                    f"Automated summary for {v_name}. The overall health score is {score.overall:.1f}/100. Please enable AI analysis for a detailed narrative.",
                    normal_style))
        story.append(Spacer(1, 20))

        # 3. Village Health Score
        story.append(
            Paragraph(
                "Village Health Score Breakdown",
                heading_style))
        score_data = [["Component",
                       "Score",
                       "Trend",
                       "Explanation"],
                      ["Overall",
                       f"{score.overall:.1f}",
                       "-",
                       "Composite weighted score"],
                      ["Water Security",
                       f"{score.water.score:.1f}",
                       score.water.trend.capitalize(),
                       score.water.explanation],
                      ["Vegetation Health",
                       f"{score.vegetation.score:.1f}",
                       score.vegetation.trend.capitalize(),
                       score.vegetation.explanation],
                      ["Climate Stability",
                       f"{score.climate.score:.1f}",
                       score.climate.trend.capitalize(),
                       score.climate.explanation],
                      ["Flood Preparedness",
                       f"{score.flood.score:.1f}",
                       score.flood.trend.capitalize(),
                       score.flood.explanation],
                      ["Land Sustainability",
                       f"{score.land.score:.1f}",
                       score.land.trend.capitalize(),
                       score.land.explanation]]

        score_table = Table(score_data, colWidths=[100, 50, 60, 260])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d2d2d')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f9f9f9')),
            ('GRID', (0, 0), (-1, -1), 1, colors.silver),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 20))

        # 4. Environmental Metrics
        story.append(Paragraph("Key Environmental Metrics", heading_style))
        metrics_data = [
            ["Metric", "Value"],
            ["NDVI (Vegetation Index)", f"{metrics.ndvi:.2f}"],
            ["NDWI (Moisture Index)", f"{metrics.ndwi:.2f}"],
            ["Surface Water Area", f"{metrics.waterAreaHa:.1f} ha"],
            ["Green Cover", f"{metrics.greenCoverPercent:.1f}%"],
            ["Average Temperature", f"{metrics.temperature:.1f} °C"],
            ["Annual Rainfall", f"{metrics.rainfall:.1f} mm"],
            ["Data Source", metrics.dataSource.capitalize()]
        ]

        metrics_table = Table(metrics_data, colWidths=[200, 200])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d2d2d')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.silver),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 20))

        # 5. Recommendations
        story.append(Paragraph("Priority Recommendations", heading_style))
        if recommendations:
            for idx, rec in enumerate(recommendations, 1):
                clean_rec_title = sanitize_text_for_pdf(rec.title)
                clean_rec_desc = sanitize_text_for_pdf(rec.description)
                clean_rec_scheme = sanitize_text_for_pdf(rec.scheme) if rec.scheme else ""
                clean_rec_impact = sanitize_text_for_pdf(rec.expectedImpact)
                clean_rec_timeframe = sanitize_text_for_pdf(rec.timeframe)

                rec_heading = f"<b>{idx}. {clean_rec_title}</b> ({rec.category.capitalize()} - {rec.urgency.capitalize()} Urgency)"
                story.append(Paragraph(rec_heading, normal_style))
                story.append(Paragraph(clean_rec_desc, normal_style))
                if clean_rec_scheme:
                    story.append(Paragraph(
                        f"<b>Relevant Scheme:</b> {clean_rec_scheme}", normal_style))
                story.append(Paragraph(
                    f"<b>Expected Impact:</b> {clean_rec_impact}", normal_style))
                story.append(Paragraph(
                    f"<b>Timeframe:</b> {clean_rec_timeframe}", normal_style))
                story.append(Spacer(1, 10))
        else:
            story.append(
                Paragraph(
                    "No recommendations available for this period.",
                    normal_style))

        story.append(Spacer(1, 20))

        # 6. 5-Year Historical Analysis
        if history and history.metrics:
            story.append(Paragraph("5-Year Historical Analysis", heading_style))
            hist_data = [["Year", "Overall Score", "NDVI", "Water Area", "Green Cover", "Rainfall"]]
            
            # Create a dictionary to easily map year to score
            score_map = {s.year: s for s in history.scores}
            
            # Sort metrics by year
            sorted_metrics = sorted(history.metrics, key=lambda m: m.year)
            for m in sorted_metrics:
                s = score_map.get(m.year)
                overall = f"{s.overall:.1f}" if s else "N/A"
                hist_data.append([
                    str(m.year),
                    overall,
                    f"{m.ndvi:.2f}",
                    f"{m.waterAreaHa:.1f} ha",
                    f"{m.greenCoverPercent:.1f}%",
                    f"{m.rainfall:.1f} mm"
                ])
                
            hist_table = Table(hist_data, colWidths=[60, 80, 60, 80, 80, 80])
            hist_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d2d2d')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f9f9f9')),
                ('GRID', (0, 0), (-1, -1), 1, colors.silver),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(hist_table)
            story.append(Spacer(1, 20))

        # 7. Methodology
        story.append(Paragraph("Data Sources & Methodology", heading_style))
        methodology_text = "This report uses Earth Engine datasets (Sentinel-2, Dynamic World, SRTM) and Open-Meteo weather data to construct heuristic environmental indicators. Calculations are generalized for regional assessments and should be ground-truthed prior to major policy decisions."
        story.append(Paragraph(methodology_text, normal_style))

        doc.build(story)

        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

