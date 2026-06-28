<div align="center">
  <img src="frontend/public/logo.png" alt="GramDrishti Logo" width="120" />

  <h1>GramDrishti (ग्रामदृष्टि)</h1>

  <p><strong>AI-Powered Climate Intelligence Platform for Indian Villages</strong></p>

  <!-- Status & Links -->
  <a href="https://gram-drishti.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-gram--drishti.vercel.app-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://youtu.be/g-fqo-nGJoQ?si=1nMoQmWFnBggIdav" target="_blank">
    <img src="https://img.shields.io/badge/Demo%20Video-Watch%20on%20YouTube-red?style=for-the-badge&logo=youtube" alt="Demo Video" />
  </a>

  <br /><br />

  <!-- Tech Stack Badges -->
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-latest-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-latest-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Google%20Earth%20Engine-enabled-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google Earth Engine" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />

</div>

---

## Quick Links

| | |
|---|---|
| **Live Application** | [https://gram-drishti.vercel.app/](https://gram-drishti.vercel.app/) |
| **Demo Video** | [https://youtu.be/g-fqo-nGJoQ?si=1nMoQmWFnBggIdav](https://youtu.be/g-fqo-nGJoQ?si=1nMoQmWFnBggIdav) |
| **Architecture Docs** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

---

## The Problem & Solution

> **The Problem**: Over 640,000 Indian villages face immense climate stress. Local administrations (Gram Panchayats) lack the tools and data to measure, understand, and mitigate these risks.
>
> **The Solution**: GramDrishti is a comprehensive, AI-powered platform that translates complex satellite and weather data into actionable environmental metrics, automated health scores, and localized AI-driven recommendations.

---

## Key Features

- **Satellite Analysis** — Processes real-time data from Google Earth Engine (Sentinel-2, Dynamic World, SRTM DEM).
- **Weather Integration** — Historical and current weather data via Open-Meteo APIs.
- **AI Recommendations** — Employs Google Gemini (with Ollama fallback) to generate actionable insights based on climate data.
- **Automated Health Scoring** — Calculates comprehensive scores across Water Security, Vegetation Health, Climate Stability, Flood Preparedness, and Land Sustainability.
- **Interactive Mapping** — Intuitive Choropleth and Data Layers built with React Leaflet.

---

## Tech Stack

### Frontend

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/Vite-latest-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/TypeScript-latest-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/TailwindCSS-latest-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />

**Libraries:** React Leaflet, Framer Motion, ECharts, TanStack Query

### Backend

<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/FastAPI-latest-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />

**Libraries:** GeoPandas, Shapely, Rasterio, Earth Engine API, Pydantic, ReportLab

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:   venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

> API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> App available at: `http://localhost:5173`

---

## Environment Variables

Copy the `.env.example` files to `.env` in their respective directories and fill in the values.

### Backend — `backend/.env`

| Variable | Description | Default / Example |
|---|---|---|
| `GEE_PROJECT_ID` | Google Earth Engine Project ID | `your-gee-project-id` |
| `GEE_SERVICE_ACCOUNT_EMAIL` | Service Account Email for GEE | `your-service-account@...` |
| `GEE_CREDENTIALS_PATH` | Path to JSON credentials file | `./credentials/gee_credentials.json` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `OPENMETEO_BASE_URL` | Base URL for Open-Meteo | `https://api.open-meteo.com/v1` |
| `ALLOWED_ORIGINS` | CORS origins (comma separated) | `http://localhost:5173` |
| `USE_MOCK_DATA` | Use local deterministic fallback data | `false` |

### Frontend — `frontend/.env`

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend URL for API calls | `http://localhost:8000` |

---

## Demo Villages

For quick testing, use these coordinates in the application:

| Village | District | Coordinates | Status |
|---|---|---|---|
| Mulshi | Pune | `[18.5204, 73.5297]` | Declining across all metrics |
| Maval | Pune | `[18.7667, 73.5833]` | Steadily improving |
| Ambegaon | Pune | `[19.1167, 73.7167]` | Slow decline |
| Khed | Pune | `[18.8333, 73.8667]` | Faster decline, drier |
| Junnar | Pune | `[19.2000, 73.8833]` | Improving |

> **Tip:** Warm up the cache for these demo villages by running `python scripts/demo_setup.py` from the root directory while the backend is running.

---

## Documentation & Architecture

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for a complete system diagram, data flows, and structural overview.

---

## Live Demo

**Try GramDrishti live:**
[https://gram-drishti.vercel.app/](https://gram-drishti.vercel.app/)

---

<div align="center">
  <sub>Built with care for rural India — GramDrishti</sub>
</div>
