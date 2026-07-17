# Project Workflow — GramDrishti

Detailed workflow diagrams for every major process in the GramDrishti platform.

---

## Table of Contents

- [User Workflow](#user-workflow)
- [Village Selection Workflow](#village-selection-workflow)
- [Dashboard Data Loading](#dashboard-data-loading)
- [AI Chat Workflow](#ai-chat-workflow)
- [Report Generation Workflow](#report-generation-workflow)
- [Backend Request Lifecycle](#backend-request-lifecycle)
- [GEE Data Retrieval Workflow](#gee-data-retrieval-workflow)
- [Error Handling Flow](#error-handling-flow)
- [Development Workflow](#development-workflow)
- [Deployment Workflow](#deployment-workflow)

---

## User Workflow

The complete end-to-end user journey from landing to action.

```mermaid
flowchart TD
    Start([User opens GramDrishti]) --> Landing[Landing Page]
    Landing --> CTA{Get Started}
    CTA --> Auth[Auth Page]
    Auth --> Login{Login or Signup}
    Login -->|Email + Password| Session[Zustand session persisted<br/>to localStorage]
    Session --> Dashboard[Dashboard<br/>Map + Sidebar]

    Dashboard --> Search[Search for a village]
    Search --> Results{Results found?}
    Results -->|Local DB match| Select[Select Village]
    Results -->|No local match| Nominatim[Fallback to Nominatim]
    Nominatim --> Register[POST /villages/register<br/>Dynamic backend registration]
    Register --> Select

    Select --> Load[Map zooms to boundary<br/>Dashboard loads metrics]

    Load --> Explore{What does the user want?}

    Explore -->|View Scores| Overview[Overview Tab<br/>Health Score Ring + Breakdown]
    Explore -->|See Environment| EnvTab[Environment Tab<br/>Metrics + Weather + Land Cover]
    Explore -->|Track Trends| History[History Tab<br/>Year-over-year charts]
    Explore -->|Toggle Layers| Layers[NDVI / NDWI / Land Cover<br/>on the map]
    Explore -->|Ask a Question| AI[AI Chat Panel]
    Explore -->|Generate Report| Report[Report Tab<br/>PDF / JSON / CSV download]

    AI --> FollowUp{Follow-up question?}
    FollowUp -->|Yes| AI
    FollowUp -->|No| Explore

    Overview --> Explore
    EnvTab --> Explore
    History --> Explore
    Layers --> Explore
    Report --> Done([User has actionable data])

    style Start fill:#2ecc71,stroke:#27ae60,color:#000
    style Done fill:#2ecc71,stroke:#27ae60,color:#000
    style AI fill:#8e75b2,stroke:#7c5fad,color:#fff
```

---

## Village Selection Workflow

What happens internally when a user selects a village.

```mermaid
sequenceDiagram
    participant User
    participant SearchBar as VillageSearch
    participant API as Backend API
    participant Nominatim as OSM Nominatim
    participant VillageCtx as VillageProvider
    participant Map as Leaflet Map
    participant Sidebar as DashboardPanel

    User->>SearchBar: Types village name
    SearchBar->>API: GET /api/v1/villages/search?q=...
    API-->>SearchBar: Local results (from SEARCH_INDEX)

    alt No local results
        SearchBar->>Nominatim: GET nominatim.openstreetmap.org/search
        Nominatim-->>SearchBar: OSM results with polygons
    end

    User->>SearchBar: Clicks a result
    SearchBar->>VillageCtx: setSelectedVillage(village)

    alt Village source is 'nominatim'
        VillageCtx->>API: POST /api/v1/villages/register
        Note over API: Adds to SEARCH_CACHE,<br/>BOUNDARY_CACHE, SEARCH_INDEX
        API-->>VillageCtx: {"status": "registered"}
    end

    VillageCtx->>API: GET /api/v1/villages/{id}
    API-->>VillageCtx: Full village data + boundary

    VillageCtx->>Map: Set selectedVillagePolygon
    Map->>Map: Render GeoJSON boundary<br/>Fly to bounds

    VillageCtx->>Sidebar: Trigger re-render
    Sidebar->>API: GET /api/v1/satellite/{id}/metrics
    Sidebar->>API: GET /api/v1/scores/{id}
    Sidebar->>API: GET /api/v1/weather/{id}
```

---

## Dashboard Data Loading

Parallel data fetching when a village is selected.

```mermaid
flowchart TD
    Select[Village Selected] --> Par{Parallel API Calls}

    Par --> Metrics[GET /satellite/{id}/metrics<br/>NDVI, NDWI, Land Cover, Weather]
    Par --> Scores[GET /scores/{id}<br/>5-dimension health scores]
    Par --> Weather[GET /weather/{id}<br/>Current conditions]
    Par --> Recs[POST /ai/{id}/recommendations<br/>AI-generated insights]

    Metrics --> Cache1{In cache?}
    Cache1 -->|Yes| Fast1[Return cached<br/>~50ms]
    Cache1 -->|No| GEE[Call Google Earth Engine<br/>~45 seconds]
    GEE --> Aggregate[Aggregator: raw GEE → EnvironmentalMetrics]
    Aggregate --> Store1[Store in TTLCache<br/>24h expiry]
    Store1 --> Fast1

    Scores --> Calc[Scoring Engine<br/>Depends on metrics]
    Calc --> Score[5 ScoreDetails + Overall]

    Fast1 --> Render[Dashboard renders:<br/>Overview, Environment, History tabs]
    Score --> Render
    Weather --> Render
    Recs --> Render

    style GEE fill:#4285f4,stroke:#3367d6,color:#fff
    style Render fill:#2ecc71,stroke:#27ae60,color:#000
```

---

## AI Chat Workflow

The complete AI pipeline from question to rendered response.

```mermaid
flowchart TD
    Q[User types question] --> Payload[Build payload:<br/>question, language, history,<br/>mapState, clickedLocation]
    Payload --> SSE[POST /ai/{village_id}/chat<br/>SSE Stream]

    SSE --> Init["▶ {status: initializing}"]
    Init --> Classify[Intent Classifier<br/>Gemini or keyword fallback]
    Classify --> Intents["Intents: [agriculture, water, ...]"]

    Intents --> Retrieve["▶ {status: retrieving}"]
    Retrieve --> RE[Retrieval Engine]
    RE --> VillageData[Fetch village + metrics + score]
    RE --> WeatherData{Intent needs weather?}
    WeatherData -->|Yes| FetchWeather[Fetch Open-Meteo data]
    WeatherData -->|No| Skip1[Skip]
    RE --> HistoryData{Intent needs history?}
    HistoryData -->|Yes| FetchHistory[Fetch 4 years of data]
    HistoryData -->|No| Skip2[Skip]
    RE --> PointData{User clicked map?}
    PointData -->|Yes| SamplePoint[Sample raster at coordinates]
    PointData -->|No| Skip3[Skip]

    VillageData --> ContextBlocks[context_blocks<br/>with source attribution]
    FetchWeather --> ContextBlocks
    FetchHistory --> ContextBlocks
    SamplePoint --> ContextBlocks
    Skip1 --> ContextBlocks
    Skip2 --> ContextBlocks
    Skip3 --> ContextBlocks

    ContextBlocks --> Confidence[Confidence Calculator<br/>0.35×GIS + 0.25×Weather +<br/>0.20×History + 0.20×Predictions]

    Confidence --> Process["▶ {status: processors}"]
    Process --> AgricProc[Agriculture Processor<br/>NDVI metrics, charts, actions]
    Process --> WaterProc[Water Processor<br/>NDWI, rainfall metrics]
    Process --> DisasterProc[Disaster Processor<br/>Flood risk assessment]
    Process --> SchemeProc[Scheme Engine<br/>Government scheme matching]

    AgricProc --> StructJSON[structured_json =<br/>{retrieved_data, processor_insights}]
    WaterProc --> StructJSON
    DisasterProc --> StructJSON
    SchemeProc --> StructJSON

    StructJSON --> LLM["▶ {status: llm}"]
    LLM --> Prompt[Prompt Builder<br/>Hallucination guards +<br/>Structured JSON context]
    Prompt --> Gemini[Gemini 2.5 Flash<br/>Generate narrative]

    Gemini --> Complete["▶ {status: completed}"]
    Complete --> Response["{answer, structured_data,<br/>follow_up_questions}"]

    Response --> Render[Frontend renders:<br/>MessageCard + DynamicChart<br/>+ ActionPanel + FollowUpChips]

    style Q fill:#2ecc71,stroke:#27ae60,color:#000
    style Gemini fill:#8e75b2,stroke:#7c5fad,color:#fff
    style Render fill:#2ecc71,stroke:#27ae60,color:#000
```

---

## Report Generation Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as ReportTab
    participant API as reports.py
    participant Satellite as satellite.py
    participant Scores as scores.py
    participant AI as ai.py
    participant PDF as VillageReportGenerator

    User->>Frontend: Click "Download PDF"
    Frontend->>API: GET /reports/{id}/pdf?year=2024&include_ai=true

    API->>Satellite: get_village_metrics()
    Satellite-->>API: EnvironmentalMetrics

    API->>Scores: get_village_score()
    Scores-->>API: VillageHealthScore

    alt include_ai = true
        API->>AI: get_village_recommendations()
        AI-->>API: [AIRecommendation × 3]
        API->>AI: get_report_narrative()
        AI-->>API: Narrative text
    end

    API->>PDF: generate_pdf(village, metrics, score, recs, narrative)
    PDF->>PDF: Build A4 document with ReportLab
    PDF->>PDF: Cover → Executive Summary → Score Table →<br/>Metrics Table → Recommendations → Methodology
    PDF-->>API: PDF bytes

    API-->>Frontend: Content-Disposition: attachment<br/>application/pdf
    Frontend-->>User: Browser download dialog
```

---

## Backend Request Lifecycle

How a typical API request flows through the backend.

```mermaid
flowchart TD
    Req[Incoming HTTP Request] --> CORS[CORS Middleware<br/>Check allowed origins]
    CORS --> Router[FastAPI Router<br/>Match route + validate params]

    Router --> RateLimit{Rate limit check<br/>AI endpoints only}
    RateLimit -->|Over limit| R429[429 Too Many Requests]
    RateLimit -->|OK| Handler[Route Handler]

    Handler --> CacheCheck{Check TTLCache}
    CacheCheck -->|Hit| Return[Return cached response]
    CacheCheck -->|Miss| Process[Process request]

    Process --> External{External API call needed?}
    External -->|GEE| GEE[Google Earth Engine<br/>asyncio.to_thread]
    External -->|Weather| OM[Open-Meteo<br/>httpx.AsyncClient]
    External -->|AI| Gemini[Gemini API<br/>httpx.AsyncClient]
    External -->|No| Compute[Local computation]

    GEE --> CacheStore[Store in TTLCache]
    OM --> CacheStore
    Compute --> CacheStore
    CacheStore --> Return

    Gemini --> Return

    GEE -->|Timeout| E504[504 Gateway Timeout<br/>GEETimeoutError]
    GEE -->|Bad Data| E422[422 Unprocessable<br/>GEEDataError]
    Gemini -->|Error| Fallback[Fallback response]

    style Req fill:#2ecc71,stroke:#27ae60,color:#000
    style Return fill:#2ecc71,stroke:#27ae60,color:#000
```

---

## GEE Data Retrieval Workflow

How satellite data is fetched and cached.

```mermaid
flowchart TD
    Req[Request for village metrics] --> Key[Build cache key:<br/>village_id + year + dataset]
    Key --> Check{TTLCache hit?}

    Check -->|Hit + Not expired| Cached[Return cached data<br/>dataSource: cached]

    Check -->|Miss| Mock{USE_MOCK_DATA?}
    Mock -->|Yes| MockData[Return MOCK_METRICS<br/>dataSource: mock]

    Mock -->|No| GEE[Call GEE APIs in parallel]

    GEE --> S2[Sentinel-2<br/>NDVI, NDWI]
    GEE --> DW[Dynamic World<br/>Land Cover]
    GEE --> SRTM[SRTM DEM<br/>Terrain]
    GEE --> JRC[JRC Water<br/>Surface Water]

    S2 --> Merge[Merge all results]
    DW --> Merge
    SRTM --> Merge
    JRC --> Merge

    Merge --> Weather[Fetch Open-Meteo<br/>Temperature, Rainfall, Humidity]
    Weather --> Aggregate[aggregate_environmental_metrics<br/>→ EnvironmentalMetrics model]

    Aggregate --> Store[Store in TTLCache<br/>TTL: 24 hours]
    Store --> Return[Return data<br/>dataSource: live]

    GEE -->|Error| Incomplete[Return partial data<br/>dataSource: incomplete]

    style Cached fill:#2ecc71,stroke:#27ae60,color:#000
    style MockData fill:#ff6b35,stroke:#e55d2b,color:#fff
    style GEE fill:#4285f4,stroke:#3367d6,color:#fff
```

---

## Error Handling Flow

```mermaid
flowchart TD
    Error[Error occurs] --> Type{Error type}

    Type -->|GEETimeoutError| T504[HTTP 504<br/>Gateway Timeout]
    Type -->|GEEDataError| T422[HTTP 422<br/>Unprocessable Entity]
    Type -->|Village not found| T404[HTTP 404<br/>Not Found]
    Type -->|Rate limit exceeded| T429[HTTP 429<br/>Too Many Requests]
    Type -->|Gemini API failure| Fallback[Return fallback response<br/>Hardcoded safe text]
    Type -->|Ollama unavailable| FallbackMock[Return mock response]
    Type -->|General exception| T500[HTTP 500<br/>Internal Server Error]

    Fallback --> Log[Log error to stderr + error.log]
    FallbackMock --> Log
    T504 --> Log
    T422 --> Log
    T404 --> Log
    T500 --> Log

    subgraph "Frontend Error Handling"
        FE_Error[API call fails] --> ErrorBoundary[ErrorBoundary component<br/>Catch render errors]
        FE_Error --> ChatError[AI Chat: Display error message<br/>in conversation]
        FE_Error --> GEEProgress[GEE Loading: Show<br/>progress indicator]
    end
```

---

## Development Workflow

```mermaid
flowchart TD
    Dev[Developer] --> Clone[git clone + cd GramDrishti]

    Clone --> BE[Backend Setup]
    Clone --> FE[Frontend Setup]

    BE --> Venv[python -m venv venv<br/>activate venv]
    Venv --> Pip[pip install -r requirements.txt]
    Pip --> Env[cp .env.example .env<br/>Add API keys]
    Env --> Uvicorn[uvicorn main:app --reload<br/>→ localhost:8000]

    FE --> Npm[npm install]
    Npm --> FEnv[cp .env.example .env]
    FEnv --> ViteDev[npm run dev<br/>→ localhost:5173]

    Uvicorn --> Docs[FastAPI Swagger UI<br/>localhost:8000/docs]

    ViteDev --> App[Open localhost:5173<br/>Full app running]

    subgraph "Optional"
        Warm[python scripts/demo_setup.py<br/>Pre-warm GEE cache]
        MockMode[Set USE_MOCK_DATA=true<br/>No API keys needed]
    end
```

---

## Deployment Workflow

### Vercel Deployment

```mermaid
flowchart LR
    Push[git push to main] --> Vercel[Vercel CI/CD]

    Vercel --> FE_Build[Frontend Build<br/>npm run build → dist/]
    Vercel --> BE_Deploy[Backend Deploy<br/>Python serverless function]

    FE_Build --> CDN[Vercel Edge CDN<br/>Static files served globally]
    BE_Deploy --> Serverless[Vercel Serverless<br/>Python 3.11, 60s timeout]

    CDN --> Users[Users]
    Serverless --> Users
```

### Manual Production Deploy

```mermaid
flowchart TD
    Build[Build Frontend] --> Dist[dist/ folder]
    Dist --> NGINX[Serve via NGINX<br/>or any static server]

    Backend[Start Backend] --> Workers[uvicorn main:app<br/>--host 0.0.0.0<br/>--port 8000<br/>--workers 4]

    NGINX --> Proxy[NGINX proxies /api/*<br/>to Uvicorn workers]
    Workers --> Proxy
```

---

*For system architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md). For demo instructions, see [DEMO_GUIDE.md](DEMO_GUIDE.md).*
