# System Architecture

```text
[Leaflet Map] ←→ [React Frontend] ←→ [FastAPI Backend]
                                           ↓
                                ┌──────────────────────┐
                                │  Google Earth Engine │
                                │  Open-Meteo Weather  │
                                │  Gemini AI / Ollama  │
                                └──────────────────────┘
```

## Data Flow
Village Selection → GEE Processing → Environmental Metrics → Health Score → AI Analysis → Dashboard + PDF Report

## Core Services
- **Google Earth Engine**: Source for satellite imagery (Sentinel-2, Dynamic World, SRTM, JRC).
- **Open-Meteo**: Free weather API for current and historical climate data.
- **AI Analyst**: Google Gemini 1.5 Flash (with fallback to Ollama qwen2.5) for synthesizing metrics into narratives and recommendations.
- **Reporting**: ReportLab for PDF generation, standard Pydantic serialization for JSON, custom CSV structuring.