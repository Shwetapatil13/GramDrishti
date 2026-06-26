# GramDrishti (ग्रामदृष्टि)
## AI-Powered Climate Intelligence Platform for Indian Villages

### Problem
640,000 Indian villages face climate stress. Gram Panchayats have no tools to measure it.

### Solution
GramDrishti changes that. It is an AI-powered Climate Intelligence Platform for Indian villages, providing actionable environmental metrics, automated health scores, and AI-driven recommendations based on satellite and weather data.

### Quick Start
**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Architecture
See `docs/ARCHITECTURE.md` for a complete system diagram and data flow.

### Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Leaflet, Framer Motion, ECharts, TanStack Query.
- **Backend**: Python 3.11+, FastAPI, GeoPandas, Shapely, Rasterio, Earth Engine API, Pydantic, ReportLab.
- **AI**: Google Gemini 1.5 Flash, Ollama (Qwen2.5) fallback.

### Environment Variables
**`backend/.env`**:
| Variable | Description |
|---|---|
| `GEE_PROJECT_ID` | Google Earth Engine Project ID |
| `GEE_SERVICE_ACCOUNT_EMAIL` | Service Account Email for GEE |
| `GEE_CREDENTIALS_PATH` | Path to JSON credentials file (`./credentials/gee_credentials.json`) |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `OPENMETEO_BASE_URL` | Base URL for Open-Meteo (default: `https://api.open-meteo.com/v1`) |
| `ALLOWED_ORIGINS` | CORS origins (e.g., `http://localhost:5173`) |
| `USE_MOCK_DATA` | Set to `true` to use deterministic mock data instead of live GEE calls |

**`frontend/.env`**:
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (e.g., `http://localhost:8000`) |

### Demo Villages
- **Mulshi** (Pune): `[18.5204, 73.5297]` - Declining across all metrics
- **Maval** (Pune): `[18.7667, 73.5833]` - Steadily improving
- **Ambegaon** (Pune): `[19.1167, 73.7167]` - Slow decline
- **Khed** (Pune): `[18.8333, 73.8667]` - Faster decline, drier
- **Junnar** (Pune): `[19.2000, 73.8833]` - Improving

### Data Sources
- **Google Earth Engine**: Sentinel-2 (NDVI, NDWI), Dynamic World (Land Cover), SRTM DEM (Terrain), JRC Global Surface Water.
- **Open-Meteo**: Weather APIs (Current & Historical).

### API Reference
Once the backend is running, visit `http://localhost:8000/docs` for the interactive OpenAPI documentation.

### Running the Demo Cache Warm-Up
Ensure the backend is running, then execute:
```bash
python scripts/demo_setup.py
```
This primes the TTLCache to ensure instant loads during the demo.

### Team
Built for Build for Good Hackathon 2026.