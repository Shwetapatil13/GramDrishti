# Changelog

All notable changes to GramDrishti are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.0] — 2026-07-17

Initial release for the **Build for Good Hackathon 2026**.

### Added

#### Core Platform
- Full-stack application: React 18 + TypeScript frontend with FastAPI + Python 3.11 backend
- Interactive Leaflet map with GeoJSON village boundary rendering
- Split-panel dashboard layout (map + data sidebar) with responsive mobile bottom sheet
- Client-side authentication with Zustand persist (login/signup)
- React Router with protected routes

#### Satellite and GIS
- Google Earth Engine integration for Sentinel-2 (NDVI, NDWI), Dynamic World (Land Cover), SRTM (Terrain), JRC (Water Occurrence)
- Real-time GEE tile URL generation for NDVI, Water, and Land Cover overlay layers
- Choropleth map layer with villages color-coded by NDVI category
- Interactive layer toggle controls
- Map click coordinate capture for AI context
- Point sampling from GEE rasters at clicked location

#### Health Scoring
- 5-dimension composite health scoring engine (Water, Vegetation, Climate, Flood, Land)
- Configurable weights (25%, 25%, 20%, 15%, 15%)
- Per-dimension scores (0–100) with trend detection (improving / stable / declining)
- Human-readable explanations per score component

#### AI Pipeline
- Agentic Deterministic Processor architecture
- LLM-powered intent classification (Gemini) with keyword fallback
- Modular Retrieval Engine with source attribution and conditional data fetching
- Four deterministic processors: Agriculture, Water, Disaster, Government Schemes
- Confidence Calculator (weighted: 0.35xGIS + 0.25xWeather + 0.20xHistory + 0.20xPredictions)
- Dynamic prompt builder with hallucination guards
- SSE streaming with real-time pipeline status indicators
- Structured JSON responses with embedded metrics, charts, and action buttons
- Follow-up question generation
- Audit logging (JSONL) for every AI interaction
- Ollama (Qwen 2.5) fallback when Gemini is unavailable
- Hardcoded fallback responses when both AI providers fail

#### Village Search
- Local GeoJSON-based search index (Maharashtra villages)
- OpenStreetMap Nominatim fallback for any Indian village
- Dynamic backend registration of Nominatim-resolved villages
- Village boundary auto-zoom on selection

#### Weather
- Open-Meteo integration for current weather conditions
- Historical annual weather data (temperature, rainfall, humidity, wind speed)
- Weather widget in the Environment dashboard tab

#### Reports
- PDF report generation (ReportLab) with cover page, executive summary, health scores, metrics, recommendations, and methodology
- JSON data export with full village metrics and scores
- CSV export for historical trend data
- AI-generated narrative for executive summary section

#### Dashboard
- Overview tab: Health Score Ring, Score Breakdown, Trend Badges
- Environment tab: Metrics Panel, Land Cover Chart, Weather Widget
- History tab: Year-over-year trend charts (NDVI, water, green cover, scores)
- Report tab: PDF/JSON/CSV download buttons
- Lazy-loaded tabs with skeleton placeholders

#### Frontend Components
- AI Chat Panel with MessageCard, DynamicChart (ECharts), ActionPanel, FollowUpChips, SuggestedQuestions
- VillageSearch with dual-source results (local + Nominatim)
- HealthScoreRing, ScoreBreakdown, ScoreCard
- MetricsPanel, WeatherWidget, InsightsPanel, RecommendationCard
- ChangeDetection, ClimateAssessment, RiskDashboard
- HistoryTab with TrendChart, HealthScoreTrendChart, LandCoverChart, NDVIPieChart
- TimelineSlider for year selection
- Landing page: Hero, Features, HowItWorks, Stats, Technology, CTA, Navbar, Footer

#### Internationalization
- i18next with browser language detection
- Full UI translations: English, Hindi, Marathi
- AI responses in selected language via prompt builder

#### Developer Experience
- Mock data system for 5 villages across 5 years (no API keys required)
- Demo cache warmup script (`scripts/demo_setup.py`)
- Boundary fetch script (`scripts/fetch_real_boundaries.py`)
- Vercel deployment configs for frontend and backend
- ESLint + Prettier + OxLint frontend tooling
- pydantic-settings for type-safe environment configuration
- Structured error handling with custom exception types
- Rate limiting on AI endpoints (10 req/min per IP)
- CORS middleware with configurable origins

---

*Built for the Build for Good Hackathon 2026.*
