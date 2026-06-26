import io
import datetime
from reportlab.lib.pagesizes import A4  # type: ignore
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer, TableStyle  # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from reportlab.lib import colors  # type: ignore
from app.models.village import Village, EnvironmentalMetrics, VillageHealthScore
from app.models.recommendations import AIRecommendationModel

class VillageReportGenerator:
    def generate_pdf(
        self,
        village: Village,
        metrics: EnvironmentalMetrics,
        score: VillageHealthScore,
        recommendations: list[AIRecommendationModel],
        ai_narrative: str,
        year: int,
        include_ai: bool = True
    ) -> bytes:
        buffer = io.BytesBytesIO() if hasattr(io, 'BytesBytesIO') else io.BytesIO()
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
        title_style.alignment = 1 # Center
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        
        story = []
        
        # 1. Cover
        story.append(Paragraph(f"GramDrishti Environmental Health Report", title_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"<b>Village:</b> {village.name} ({village.nameHindi})", normal_style))
        story.append(Paragraph(f"<b>District:</b> {village.district}, {village.state}", normal_style))
        story.append(Paragraph(f"<b>Analysis Year:</b> {year}", normal_style))
        story.append(Paragraph(f"<b>Generated On:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
        story.append(Spacer(1, 30))
        
        # 2. Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        if include_ai and ai_narrative:
            story.append(Paragraph(ai_narrative, normal_style))
        else:
            story.append(Paragraph(f"Automated summary for {village.name}. The overall health score is {score.overall:.1f}/100. Please enable AI analysis for a detailed narrative.", normal_style))
        story.append(Spacer(1, 20))
        
        # 3. Village Health Score
        story.append(Paragraph("Village Health Score Breakdown", heading_style))
        score_data = [
            ["Component", "Score", "Trend", "Explanation"],
            ["Overall", f"{score.overall:.1f}", "-", "Composite weighted score"],
            ["Water Security", f"{score.water.score:.1f}", score.water.trend.capitalize(), score.water.explanation],
            ["Vegetation Health", f"{score.vegetation.score:.1f}", score.vegetation.trend.capitalize(), score.vegetation.explanation],
            ["Climate Stability", f"{score.climate.score:.1f}", score.climate.trend.capitalize(), score.climate.explanation],
            ["Flood Preparedness", f"{score.flood.score:.1f}", score.flood.trend.capitalize(), score.flood.explanation],
            ["Land Sustainability", f"{score.land.score:.1f}", score.land.trend.capitalize(), score.land.explanation]
        ]
        
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
                rec_title = f"<b>{idx}. {rec.title}</b> ({rec.category.capitalize()} - {rec.urgency.capitalize()} Urgency)"
                story.append(Paragraph(rec_title, normal_style))
                story.append(Paragraph(rec.description, normal_style))
                if rec.scheme:
                    story.append(Paragraph(f"<b>Relevant Scheme:</b> {rec.scheme}", normal_style))
                story.append(Paragraph(f"<b>Expected Impact:</b> {rec.expectedImpact}", normal_style))
                story.append(Paragraph(f"<b>Timeframe:</b> {rec.timeframe}", normal_style))
                story.append(Spacer(1, 10))
        else:
            story.append(Paragraph("No recommendations available for this period.", normal_style))
            
        story.append(Spacer(1, 20))
        
        # 6. Methodology
        story.append(Paragraph("Data Sources & Methodology", heading_style))
        methodology_text = "This report uses Earth Engine datasets (Sentinel-2, Dynamic World, SRTM) and Open-Meteo weather data to construct heuristic environmental indicators. Calculations are generalized for regional assessments and should be ground-truthed prior to major policy decisions."
        story.append(Paragraph(methodology_text, normal_style))
        
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes