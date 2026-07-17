# Demo Guide — GramDrishti

A step-by-step guide for demonstrating GramDrishti to hackathon judges. Designed to walk through the full platform in under 5 minutes.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Pre-Demo Cache Warmup](#pre-demo-cache-warmup)
- [Demo Script](#demo-script)
- [Demo Accounts](#demo-accounts)
- [Sample Inputs and Expected Outputs](#sample-inputs-and-expected-outputs)
- [Features to Demonstrate](#features-to-demonstrate)
- [Judge Checklist](#judge-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Check Command |
|---|---|---|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

**Optional (for live satellite data):**
- Google Earth Engine service account + credentials JSON
- Google Gemini API key

> No API keys? Set `USE_MOCK_DATA=true` in `backend/.env`. The entire application works with deterministic mock data.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Shwetapatil13/GramDrishti.git
cd GramDrishti
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

---

## Running the Application

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate    # or source venv/bin/activate
uvicorn main:app --reload
```
> Backend runs on `http://localhost:8000`
> API docs at `http://localhost:8000/docs`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
> Frontend runs on `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

Minimum for demo with mock data:
```env
GEMINI_API_KEY=your_gemini_api_key_here
USE_MOCK_DATA=true
```

Full configuration for live data:
```env
GEE_PROJECT_ID=your-gee-project-id
GEE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GEE_CREDENTIALS_PATH=./credentials/gee_credentials.json
GEMINI_API_KEY=your_gemini_api_key_here
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
USE_MOCK_DATA=false
DEBUG=true
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## Pre-Demo Cache Warmup

Before a live demo, run the warmup script to ensure instant load times:

```bash
# From the project root, with the backend running:
python scripts/demo_setup.py
```

This pre-fetches satellite metrics, health scores, AI summaries, and recommendations for all 5 demo villages across all 5 years. After warmup, dashboard loads take under 2 seconds instead of ~45 seconds.

Expected output:
```
Warming mulshi 2022...
  OK mulshi 2022 cached
Warming mulshi 2023...
  OK mulshi 2023 cached
...
```

---

## Demo Script

### Minute 0–1: The Problem and Landing Page

1. Open `http://localhost:5173`
2. Show the landing page and point out the headline: "See Every Village. Solve Problems Before They Become Crises."
3. Explain the problem:
   > "India has 640,000 villages. Their local governments make water, agriculture, and disaster decisions without any environmental data. GramDrishti changes that."
4. Click **Get Started** to navigate to the auth page.

### Minute 1–2: Authentication and Village Selection

5. Log in with any email (e.g., `demo@gramdrishti.in`) and password.
6. The dashboard appears — split-panel with the map on the left and data panel on the right.
7. Search for **Mulshi** in the search bar.
8. Select Mulshi from the results.
9. Point out: the map zooms to Mulshi's real GeoJSON boundary; the dashboard starts loading satellite data; the GEE progress indicator shows "Retrieving satellite data..."

### Minute 2–3: Dashboard and Health Scores

10. Once loaded, show the **Overview tab:**
    - Health Score Ring (overall score out of 100)
    - Score Breakdown (Water, Vegetation, Climate, Flood, Land — each with trend badges)
    - Explain: "These scores are computed from satellite indices — NDVI for vegetation, NDWI for water, SRTM for flood risk."
11. Switch to the **Environment tab** — show NDVI, NDWI, rainfall, temperature, land cover pie chart.
12. Switch to the **History tab** — show year-over-year trends and point out: "Mulshi's NDVI has been declining from 0.61 in 2022 to 0.48 in 2026 — a measurable loss of vegetation."

### Minute 3–4: Map Layers and AI Chat

13. Toggle the **NDVI layer** on the map — show satellite vegetation imagery over the village boundary.
14. Click on a point on the map to set a location context.
15. Open the **AI Chat panel** and ask: **"How is the agriculture?"**
16. Point out the real-time pipeline: "Initializing..." → "Retrieving data..." → "Running processors..." → "Generating response..."
17. When the response arrives, show:
    - The narrative text grounded in real data
    - The embedded NDVI trend chart rendered inline in the chat
    - The "Toggle NDVI Layer" action button — clicking it toggles the map layer from within the chat
18. Click a follow-up question chip like "Show NDVI trends."

### Minute 4–5: Reports and Wrap-Up

19. Switch to the **Report tab** in the dashboard.
20. Click **Download PDF Report**.
21. Open the PDF and show: cover page, executive summary, health score table, metrics table, prioritized recommendations with scheme links, and the data sources disclaimer.
22. Wrap up:
    > "Unlike typical AI projects, GramDrishti never hallucinates. Every number in the chat is computed by deterministic Python processors — the LLM only writes the narrative. Every data point has source attribution and confidence scoring. And this works for any village in India."

---

## Demo Accounts

Authentication is client-side (Zustand with localStorage). Any email and password combination works.

| Email | Password |
|---|---|
| `demo@gramdrishti.in` | `demo123` |
| `judge@hackathon.dev` | `anything` |

---

## Sample Inputs and Expected Outputs

### AI Chat Questions

| Question | Expected Behavior |
|---|---|
| "How is the agriculture?" | Returns NDVI analysis with trend chart, crop stress assessment, toggle_layer action |
| "What about water availability?" | Returns NDWI and rainfall analysis with trend chart |
| "Is there a flood risk?" | Returns flood risk assessment based on terrain, rainfall, and preparedness score |
| "What government schemes apply here?" | Returns matched schemes (PMKSY, Soil Health Card) based on environmental conditions |
| "Show me a summary" | Triggers "general" intent — runs all processors, comprehensive response |
| "Tell me about this location" (after clicking map) | Incorporates clicked coordinates and point sampling into the response |

### Language Switching

| Language | UI Translation | AI Response |
|---|---|---|
| English | Full | Full |
| Hindi | Full | AI responds in Hindi with agricultural terminology |
| Marathi | Full | AI responds in Marathi |

### Demo Villages

| Village | Overall Trend | Key Metric |
|---|---|---|
| Mulshi | Declining | NDVI: 0.61 in 2022, 0.48 in 2026 |
| Maval | Improving | Steady NDVI increase |
| Ambegaon | Slow decline | Gradual degradation across dimensions |
| Khed | Faster decline | Low NDWI, lower rainfall |
| Junnar | Improving | Recovery trend |

---

## Features to Demonstrate

In order of impact:

1. Village search and map zoom — shows the GIS foundation
2. Health score breakdown — shows quantitative environmental intelligence
3. AI chat with live pipeline indicators — shows the RAG architecture
4. Embedded charts in AI response — shows deterministic processor output
5. Map layer toggle from AI response — shows AI-controlled UI interaction
6. PDF report download — shows formal output generation
7. History tab with trend charts — shows temporal analysis
8. Language switching — shows multi-language support
9. Click-on-map AI context — shows spatial awareness
10. Any-village search via Nominatim — shows scalability to all Indian villages

---

## Judge Checklist

| Question a judge will ask | Where to show it |
|---|---|
| What problem does this solve? | Landing page + verbal pitch |
| Is it a working product? | Live demo — no slides needed |
| Does the AI use real data? | Point to structured_data in AI response and audit logs |
| Can it work for any village? | Search for a village not in the demo set via Nominatim |
| How is hallucination prevented? | Explain: processors compute numbers, LLM narrates; confidence scoring |
| What is technically impressive? | SSE streaming, deterministic processors, source attribution, audit trail |
| Is it complete end-to-end? | Search → scores → AI → PDF report |
| Can it scale? | Explain: stateless backend, TTL cache, Vercel deployment ready |
| Is the code well organized? | Show repository structure in README |
| Where does the data come from? | Explain Sentinel-2, Dynamic World, Open-Meteo, Nominatim |

---

## Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'app'`

Make sure you are running `uvicorn main:app --reload` from inside the `backend/` directory.

---

**Error:** `Failed to initialize on startup: GEE initialization failed`

Set `USE_MOCK_DATA=true` in `backend/.env` to bypass GEE authentication.

---

### Frontend shows "Network Error"

1. Ensure the backend is running on `http://localhost:8000`
2. Ensure `ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`
3. Ensure `VITE_API_URL=http://localhost:8000` in `frontend/.env`

---

### AI Chat returns a fallback response

1. Get a free API key from [Google AI Studio](https://aistudio.google.com)
2. Set `GEMINI_API_KEY=your_key` in `backend/.env`
3. Restart the backend

> The app still works without a Gemini key — it returns hardcoded fallback responses. Non-AI features (maps, scores, metrics) are unaffected.

---

### Map tiles not loading

GEE tile URLs require valid GEE authentication. Set `USE_MOCK_DATA=true` — the base OpenStreetMap map will still render. Only the overlay layers (NDVI, Land Cover) require GEE.

---

### First dashboard load takes a long time

This is expected — ~45 seconds on first load for a new village (GEE computation). Run `python scripts/demo_setup.py` to pre-warm the cache before demos.

---

*For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md). For the full feature list, see [README.md](README.md).*
