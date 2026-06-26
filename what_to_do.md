# GRAMDRISHTI — MASTER DEVELOPMENT PROMPT
## Version 2.0 | Hackathon Build | Build for Good 2026

---

You are simultaneously acting as:
- Senior Full Stack Engineer
- GIS / Remote Sensing Engineer
- AI / LLM Engineer
- UI/UX Designer (The Verge design system)
- DevOps Engineer
- QA Engineer
- Software Architect

Your only objective is to build **GramDrishti (ग्रामदृष्टि)** — an AI-powered Climate Intelligence Platform for Indian villages — to production-quality MVP standards, level by level, with a mandatory audit and level report between every level.

---

# ABSOLUTE RULES — NEVER VIOLATE

## Rule 1 — One Level At A Time
Never build more than one level simultaneously.
Complete every task in the current level.
Run the full audit.
Fix every issue found.
Produce the Level Report.
Only then move to the next level.
Skipping levels is not allowed under any circumstances.

## Rule 2 — Plan Before You Build
At the start of every level, before writing any code:
1. State what you are about to build in plain English.
2. List every file you will create or modify.
3. Identify any architectural decisions you need to make.
4. Flag any ambiguities and resolve them with the best available judgment.
5. Only after this planning step is complete: write code.

## Rule 3 — Mandatory Audit + Level Report After Every Level
After every level:
- Run the complete audit checklist defined for that level.
- If any item fails: stop, fix, re-run the audit from the beginning.
- Only when every audit item passes: produce the Level Report (format defined below).
- Only after the Level Report is produced: proceed to the next level.

## Rule 4 — Zero Tolerance For Bugs
If there is any:
- TypeScript error
- Python error
- ESLint warning
- Build failure
- Runtime crash
- Broken route
- Console warning
- Import error
- Missing environment variable
- Broken responsive layout

STOP. Fix it. Then continue.

## Rule 5 — Production Code Only
Every file must be:
- Typed (TypeScript strict / Python type hints)
- Modular (single responsibility)
- Reusable (no one-off components)
- Documented (JSDoc / Python docstrings)
- Scalable (no hardcoded magic numbers or scores)
- Clean (no TODOs, no console.logs, no dead code, no commented-out code)

## Rule 6 — Folder Separation Is Sacred
Frontend code lives only inside `/frontend`
Backend code lives only inside `/backend`
Python virtual environment lives only inside `/backend/venv`
Never mix them.
Never import across boundaries except via HTTP API.

## Rule 7 — Never Hallucinate
If uncertain about:
- GEE dataset names or parameters
- Library APIs or function signatures
- Real village coordinates or boundaries
- Government scheme names or details

Do not invent. Stop. Use the best verifiable knowledge available. If still uncertain, leave a clearly marked `# VERIFY:` comment and flag it in the Level Report under "Known Gaps".

## Rule 8 — Scores Must Be Calculated, Never Hardcoded
Every Village Health Score, component score, and metric must be derived mathematically from real input data (or mock data matching the real schema).
`Math.random()` is forbidden.
Hardcoded score values are forbidden.

## Rule 9 — Commit After Every Level
After every passing audit and Level Report, commit:
```bash
git add .
git commit -m "feat(levelN): [description of what was completed]"
```
Use semantic commit prefixes: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

---

# LEVEL REPORT FORMAT

Produce this report after every level audit passes. Use exactly this structure:

```
═══════════════════════════════════════════
LEVEL [N] REPORT — [LEVEL NAME]
═══════════════════════════════════════════

STATUS: PASS ✓

COMPLETED
─────────
• [List every task completed]

FILES CREATED
─────────────
• [path/to/file.ts] — [one-line description]

FILES MODIFIED
──────────────
• [path/to/file.ts] — [what changed and why]

NEW DEPENDENCIES
────────────────
• [package] — [reason]

ARCHITECTURE DECISIONS
──────────────────────
• [Decision made and rationale]

KNOWN GAPS
──────────
• [Anything marked VERIFY:, any placeholder, any deferred work]

TECHNICAL DEBT
──────────────
• [Any shortcuts taken and plan to fix them]

NEXT LEVEL PREREQUISITES
────────────────────────
• [What must be true before Level N+1 can begin]

═══════════════════════════════════════════
```

---

# PROJECT STRUCTURE

Create exactly this structure before writing any code:

```
GramDrishti/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/
│   │   │   ├── dashboard/
│   │   │   ├── ai/
│   │   │   ├── charts/
│   │   │   ├── reports/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── assets/
│   │   └── styles/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   └── .env
├── backend/
│   ├── venv/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── gee/
│   │   │   ├── weather/
│   │   │   ├── scoring/
│   │   │   ├── ai/
│   │   │   └── reports/
│   │   └── utils/
│   ├── tests/
│   ├── credentials/          ← gitignored, never committed
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── docs/
├── assets/
├── datasets/
├── scripts/
└── README.md
```

---

# TECH STACK — PINNED VERSIONS

Pin all versions. Compatibility across this stack (GEE + Leaflet + ECharts + FastAPI) is non-trivial. Do not upgrade without a verified reason.

## Frontend
- React 18.3.x
- Vite 5.3.x
- TypeScript 5.5.x (strict mode)
- Tailwind CSS 3.4.x
- React Leaflet 4.2.x
- Leaflet 1.9.x
- Framer Motion 11.x
- Apache ECharts 5.5.x + echarts-for-react 3.x
- TanStack Query (React Query) 5.x
- Axios 1.7.x
- Lucide React 0.400.x

## Backend
- Python 3.11.x
- FastAPI 0.111.0
- Uvicorn 0.30.1
- GeoPandas 0.14.4
- Shapely 2.0.4
- NumPy 1.26.4
- Pandas 2.2.2
- Rasterio 1.3.10
- earthengine-api 0.1.409
- Pydantic 2.7.3
- pydantic-settings 2.3.1
- python-dotenv 1.0.1
- httpx 0.27.0
- google-generativeai 0.7.2
- reportlab 4.2.2
- Pillow 10.4.0
- python-multipart 0.0.9

## AI
- Primary: Google Gemini 1.5 Flash (via `google-generativeai`)
- Fallback: Ollama with Qwen2.5 (`http://localhost:11434`) — used automatically when `GEMINI_API_KEY` is absent or empty

## GIS Data Sources (all real, no substitutes)
- Google Earth Engine (Sentinel-2, Dynamic World, SRTM DEM, JRC Surface Water)
- Open-Meteo API (free, no key required)
- OpenStreetMap via CartoDB Dark Matter tiles

---

# GOOGLE EARTH ENGINE — MANDATORY REQUIREMENTS

GEE is the primary geospatial data source. Real satellite data must be used in the final demo. Mock data is permitted only during frontend development when GEE auth is not yet configured; it must be replaced the moment authentication is available.

## Required Datasets

### Sentinel-2 Surface Reflectance
```
COPERNICUS/S2_SR_HARMONIZED
```
Used for: NDVI, NDWI, RGB visualization, vegetation health, water detection.

### Dynamic World
```
GOOGLE/DYNAMICWORLD/V1
```
Used for: Land cover classification (water, trees, grass, flooded_vegetation, crops, shrub_and_scrub, built, bare, snow_and_ice).

### SRTM Digital Elevation Model
```
USGS/SRTMGL1_003
```
Used for: Elevation, slope, flood susceptibility terrain analysis.

### JRC Global Surface Water
```
JRC/GSW1_4/GlobalSurfaceWater
```
Used for: Water body history, permanent vs seasonal water, water occurrence trends.

## GEE Data Flow
```
User selects village
       │
       ▼
Leaflet returns village boundary (GeoJSON)
       │
       ▼
FastAPI receives boundary
       │
       ▼
Convert GeoJSON → ee.Geometry.Polygon
       │
       ▼
Clip all datasets to geometry
       │
       ▼
Run reduceRegion() for each dataset
       │
       ▼
Post-process: calculate NDVI, NDWI, land cover %, water area
       │
       ▼
Return processed JSON (no raw imagery ever sent to frontend)
```

## GEE Authentication
- Use Google Cloud Service Account
- Credentials: Project ID + Service Account Email + Service Account JSON
- Load from `.env` and `credentials/` directory
- Credentials directory is gitignored, never committed
- `ee.Initialize()` called once at backend startup

## GEE Performance Rules
- Cache every GEE result: key = `{village_id}_{year}_{dataset}`
- Cache TTL: 24 hours (scores are stable per year once computed)
- Never call GEE twice for the same village+year+dataset combination
- GEE call timeout: 120 seconds → return 504 with message
- Retry: 3 attempts with exponential backoff (2s, 4s, 8s)
- Log response time for every GEE call

## GEE UI Feedback (Critical — Not In Original Spec)
GEE calls can take 30–90 seconds. The frontend must communicate this:
- Show a progress indicator with message: "Retrieving satellite data (this takes ~45s on first load)…"
- After cache warms: show "Loading from cache…" with near-instant response
- Never show a blank spinner with no context

## Development Mode (Mock Data)
If GEE is not yet authenticated during development, use the deterministic mock data defined at the bottom of this prompt. This mock data:
- Matches the exact production schema
- Encodes a deliberate demo narrative (Mulshi declining, Maval improving)
- Must be replaced with live GEE data before final submission
- Is never used if `GEE_CREDENTIALS_PATH` resolves to a valid file

---

# DESIGN SYSTEM — THE VERGE INSPIRED (ADAPTED FOR GIS DASHBOARD)

## Color Palette

```css
/* Canvas */
--canvas-black: #131313;
--surface-slate: #1a1a1a;
--surface-elevated: #222222;
--surface-border: #2d2d2d;

/* Brand Accents */
--jelly-mint: #3cffd0;
--console-mint: #309875;
--verge-violet: #5200ff;
--deep-link-blue: #3860be;

/* Text */
--text-primary: #ffffff;
--text-secondary: #949494;
--text-muted: #e9e9e9;
--text-inverted: #131313;

/* Semantic */
--color-success: #3cffd0;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3860be;

/* Score Color Scale */
--score-excellent: #3cffd0;   /* 80-100 */
--score-good: #86efac;        /* 60-79  */
--score-medium: #f59e0b;      /* 40-59  */
--score-poor: #ef4444;        /* 0-39   */
```

## Typography

Google Fonts import (Space Grotesk + Space Mono):
```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap
```

**Space Grotesk** — all body text, headings, village names, descriptions.
**Space Mono** — ONLY for: labels, tags, timestamps, pill badges, mono data values. Always uppercase when used as a label. Never use Space Mono for sentences or paragraphs.

```css
.text-display   { font: 700 3.5rem/0.90 'Space Grotesk'; letter-spacing: -0.02em; }
.text-heading-lg { font: 700 1.5rem/1.10 'Space Grotesk'; }
.text-heading-md { font: 500 1.125rem/1.20 'Space Grotesk'; }
.text-body       { font: 400 0.9375rem/1.60 'Space Grotesk'; }
.text-mono       { font: 600 0.6875rem/1 'Space Mono'; letter-spacing: 0.15em; text-transform: uppercase; }
.text-mono-lg    { font: 600 0.75rem/1 'Space Mono'; letter-spacing: 0.12em; text-transform: uppercase; }
```

## Layout Rules
- Max content width: 1400px
- Sidebar: 280px fixed
- Main content: flex-1
- Base spacing unit: 8px
- Section gaps: 24px
- Card gaps: 16px
- **No shadows** — use border color changes for elevation
- **No gradients** — solid color blocks only
- **Dark canvas everywhere** — no light mode, no light panels

## Component Patterns

### Card
```css
background: #1a1a1a;
border: 1px solid #2d2d2d;
border-radius: 20px;
padding: 24px;
/* Hover */ border-color: #309875; transition: border-color 150ms ease;
/* Selected */ border-color: #3cffd0; box-shadow: 0 0 0 1px #3cffd0 inset;
```

### Primary Button
```css
background: #3cffd0; color: #131313;
font: 600 0.75rem/1 'Space Mono'; letter-spacing: 0.12em; text-transform: uppercase;
border-radius: 24px; padding: 10px 24px; border: none;
/* Hover */ background: rgba(255,255,255,0.2); color: #000; outline: 1px solid #c2c2c2;
transition: all 180ms ease;
```

### Secondary Button
```css
background: #2d2d2d; color: #e9e9e9;
font: 400 0.9375rem/1 'Space Grotesk';
border-radius: 24px; padding: 10px 24px;
/* Hover */ background: rgba(255,255,255,0.15); color: #000;
```

### Pill Tag
```css
background: [accent]; color: #131313;
font: 600 0.625rem/1 'Space Mono'; letter-spacing: 0.18em; text-transform: uppercase;
border-radius: 20px; padding: 4px 10px;
```

### Score Ring
```
SVG circle, 120×120px, stroke-width 8px
Background ring: #2d2d2d
Score ring: color from --score-* scale
Center: score number Space Grotesk 32px/700
Animated: ring draws in on mount (Framer Motion)
```

### Environmental Metric Card
```css
background: #1a1a1a; border: 1px solid #2d2d2d;
border-left: 3px solid [metric accent color];
border-radius: 12px; padding: 16px 20px;
```

### GEE Progress Indicator
```css
background: #1a1a1a; border: 1px solid #309875;
border-radius: 12px; padding: 16px 20px;
/* Pulsing mint left border */
animation: pulse-border 1.5s ease-in-out infinite;
```

### AI Chat Panel
```css
/* Panel */ background: #1a1a1a; border: 1px solid #2d2d2d; border-radius: 20px;
/* User message */ background: #2d2d2d; border-radius: 16px 16px 4px 16px; text-align: right;
/* AI message */ border: 1px solid #309875; border-radius: 16px 16px 16px 4px;
```

### Map Container
```css
background: #0a0a0a; border: 1px solid #2d2d2d;
border-radius: 20px; overflow: hidden;
```

### Timeline Slider
```css
/* Track */ background: #2d2d2d; height: 4px;
/* Active */ background: #3cffd0;
/* Thumb */ background: #3cffd0; width: 16px; height: 16px; border-radius: 50%;
/* Labels */ font: 600 0.625rem/1 'Space Mono'; text-transform: uppercase;
```

---

# SHARED TYPESCRIPT TYPES

Define these in `frontend/src/types/index.ts` and never deviate from them. Backend Pydantic models must mirror these exactly.

```typescript
export interface Village {
  id: string;
  name: string;
  nameHindi: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  boundary: GeoJSON.Polygon;
  area: number; // km²
}

export interface EnvironmentalMetrics {
  villageId: string;
  year: number;
  ndvi: number;              // -1 to 1
  ndwi: number;              // -1 to 1
  waterAreaHa: number;       // hectares
  greenCoverPercent: number; // 0-100
  landCover: LandCoverBreakdown;
  temperature: number;       // celsius
  rainfall: number;          // mm annual
  humidity: number;          // percent
  windSpeed: number;         // km/h
  dataSource: 'live' | 'cached' | 'mock';
}

export interface LandCoverBreakdown {
  cropland: number;      // percent
  trees: number;
  water: number;
  builtArea: number;
  grassland: number;
  bareLand: number;
  flooded: number;
}

export interface VillageHealthScore {
  villageId: string;
  year: number;
  overall: number;           // 0-100
  water: ScoreDetail;
  vegetation: ScoreDetail;
  climate: ScoreDetail;
  flood: ScoreDetail;
  land: ScoreDetail;
}

export interface ScoreDetail {
  score: number;             // 0-100
  explanation: string;
  trend: 'improving' | 'stable' | 'declining';
  trendValue: number;        // delta from previous year
}

export interface AIRecommendation {
  priority: 1 | 2 | 3;
  category: 'water' | 'vegetation' | 'climate' | 'flood' | 'land';
  title: string;
  description: string;
  scheme?: string;           // e.g. "MGNREGA", "PMKSY"
  expectedImpact: string;
  timeframe: string;
  costEstimate?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface HistoricalData {
  villageId: string;
  years: number[];
  metrics: EnvironmentalMetrics[];
  scores: VillageHealthScore[];
}

export interface GEEStatus {
  loading: boolean;
  cached: boolean;
  estimatedSeconds?: number;
  error?: string;
}
```

---

# THE 12 DEVELOPMENT LEVELS

---

## LEVEL 1 — PROJECT FOUNDATION

### Objective
Create the complete project structure with all configurations working, frontend-backend communication verified, and design system tokens operational.

### Planning Step (Do This Before Any Code)
State: what you will build, every file you will create, and every architectural decision you need to make for this level.

### Tasks — Frontend

1. Initialize Vite + React + TypeScript inside `/frontend`:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   ```

2. Install all frontend dependencies (use exact pinned versions from tech stack section):
   ```bash
   npm install react-leaflet@4.2.x leaflet@1.9.x framer-motion@11.x echarts@5.5.x echarts-for-react@3.x @tanstack/react-query@5.x axios@1.7.x lucide-react@0.400.x
   npm install -D tailwindcss@3.4.x postcss autoprefixer @types/leaflet eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser
   ```

3. Configure `tailwind.config.ts`:
   - All CSS custom properties from design system mapped to Tailwind tokens
   - Font families: `grotesk: ['Space Grotesk', 'sans-serif']`, `mono: ['Space Mono', 'monospace']`
   - Custom border-radius: `card: '20px'`, `button: '24px'`, `tag: '20px'`
   - Content paths for tree-shaking

4. Configure `tsconfig.json`:
   - `"strict": true`
   - `"noUnusedLocals": true`
   - `"noUnusedParameters": true`
   - `"noFallthroughCasesInSwitch": true`
   - Path alias: `"@/*": ["./src/*"]`

5. Configure `.eslintrc.cjs`:
   - TypeScript strict rules
   - React hooks rules
   - `@typescript-eslint/no-explicit-any: error`
   - `no-console: error`

6. Configure `.prettierrc`:
   ```json
   { "semi": true, "trailingComma": "all", "singleQuote": true, "printWidth": 100, "tabWidth": 2 }
   ```

7. Create `frontend/.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_GEMINI_API_KEY=your_key_here
   ```

8. Create `frontend/src/styles/globals.css`:
   - Google Fonts import (Space Grotesk + Space Mono)
   - All CSS variables from design system
   - Base: `body { background: #131313; color: #ffffff; font-family: 'Space Grotesk', sans-serif; }`
   - Leaflet overrides (dark map controls, no default blue)
   - Custom scrollbar: `#2d2d2d` track, `#3cffd0` thumb, 6px width

9. Create `frontend/src/constants/design.ts` — export all color tokens and spacing as typed TypeScript constants. Single source of truth; never use raw hex strings in components.

10. Create `frontend/src/types/index.ts` — all shared types as defined in the SHARED TYPESCRIPT TYPES section above.

11. Create `frontend/src/services/api.ts` — Axios instance:
    - Base URL from `import.meta.env.VITE_API_BASE_URL`
    - Request interceptor: add `Content-Type: application/json`
    - Response interceptor: extract `.data`, handle 4xx/5xx with typed errors
    - Typed generic `get<T>`, `post<T>` wrappers

12. Create `frontend/src/App.tsx` — renders "GramDrishti — Loading..." centered on `#131313` canvas using Space Grotesk. Confirms fonts and Tailwind are working. No logic yet.

13. Create `frontend/src/components/ui/Button.tsx`:
    - Props: `variant: 'primary' | 'secondary' | 'outlined'`, `size: 'sm' | 'md' | 'lg'`, `loading?: boolean`, `disabled?: boolean`
    - All styled per design system
    - Loading state: pulsing opacity, no spinner (keep it clean)
    - Full TypeScript props interface, JSDoc

14. Create `frontend/src/components/ui/Card.tsx`:
    - Props: `hover?: boolean`, `active?: boolean`, `className?: string`
    - Default / hover / active border states per design system
    - Framer Motion `whileHover` for border transition

15. Create `frontend/src/components/ui/Skeleton.tsx`:
    - Reusable skeleton loader
    - Props: `width`, `height`, `borderRadius`
    - Shimmer animation: `#2d2d2d` base, `#1a1a1a` shimmer pass
    - Used by every data-dependent component

16. Create `frontend/src/components/ui/GEEProgress.tsx`:
    - Shows when a GEE call is in flight
    - Props: `message: string`, `cached: boolean`
    - Cached: "Loading from cache…" (near-instant feel)
    - Live: "Retrieving satellite data (~45s on first load)…" with pulsing mint border
    - This component is mandatory for every GEE-dependent section

### Tasks — Backend

1. Create virtualenv:
   ```bash
   cd backend && python3.11 -m venv venv && source venv/bin/activate
   ```

2. Create `backend/requirements.txt` with all pinned versions from tech stack and install.

3. Create `backend/.env`:
   ```
   GEE_PROJECT_ID=your_gee_project_id
   GEE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GEE_CREDENTIALS_PATH=./credentials/gee_credentials.json
   GEMINI_API_KEY=your_gemini_api_key
   OPENMETEO_BASE_URL=https://api.open-meteo.com/v1
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   DEBUG=true
   USE_MOCK_DATA=false
   ```

4. Create `backend/app/core/config.py` — Pydantic Settings class. All env vars typed and validated. `USE_MOCK_DATA` boolean flag controls mock vs live GEE.

5. Create `backend/app/core/logging.py` — structured logging. Log format: `[LEVEL] [timestamp] [module] message`. Every GEE call logs start time, end time, and duration.

6. Create `backend/main.py` — FastAPI app with CORS, startup event (initializes GEE if not mock mode), includes all routers.

7. Create `backend/app/api/routes/health.py`:
   ```
   GET /api/v1/health → {"status": "ok", "version": "1.0.0", "gee_initialized": bool, "mock_mode": bool}
   ```

8. Create `backend/app/api/routes/villages.py` — placeholder returning 5 hardcoded Pune district villages.

9. Create `backend/app/models/village.py` — Pydantic v2 models mirroring the TypeScript types exactly.

10. Create `backend/app/utils/geo.py` — coordinate validation, bounding box calculation, GeoJSON helpers, GeoJSON→ee.Geometry converter (stubbed for now, implemented in Level 3).

11. Create `backend/app/utils/cache.py` — in-memory cache with TTL:
    ```python
    class TTLCache:
        def get(self, key: str) -> dict | None
        def set(self, key: str, value: dict, ttl_seconds: int = 86400) -> None
        def invalidate(self, key: str) -> None
        def build_key(self, village_id: str, year: int, dataset: str) -> str
    ```

### Verification (Before Audit)
- `npm run dev` — starts on port 5173, no errors
- `uvicorn main:app --reload` — starts on port 8000, no errors
- `curl http://localhost:8000/api/v1/health` — returns expected JSON
- `curl http://localhost:8000/api/v1/villages` — returns village list
- `npm run tsc -- --noEmit` — zero TypeScript errors
- `npm run lint` — zero ESLint warnings

### LEVEL 1 AUDIT CHECKLIST
```
□ Git repository initialized with complete .gitignore (venv, .env, node_modules, credentials/, *.pyc, dist/)
□ Folder structure matches specification exactly
□ Frontend starts without errors on port 5173
□ Backend starts without errors on port 8000
□ TypeScript strict mode enabled and zero errors
□ ESLint passes with zero warnings
□ Prettier configured
□ Tailwind configured with all design system tokens
□ Google Fonts loading correctly (Space Grotesk, Space Mono)
□ CSS variables defined and accessible
□ Canvas background #131313 rendering correctly
□ All shared TypeScript types defined and exported
□ Axios service configured with base URL from env var
□ CORS configured correctly on FastAPI
□ Health endpoint returns 200 with gee_initialized and mock_mode fields
□ Villages endpoint returns 5 villages with all required fields
□ Frontend-backend communication working
□ GEEProgress component created and typed
□ Skeleton component created and typed
□ Button component: all three variants styled correctly
□ Card component: hover and active states working
□ TTLCache utility implemented and typed
□ Environment variables in .env files, never hardcoded in source
□ No secrets in git history
□ No console.log statements
□ No TypeScript 'any' usage
□ No dead code
□ requirements.txt complete with pinned versions
□ venv exists inside backend/
□ README.md exists at root with project description
```

---

## LEVEL 2 — DASHBOARD SHELL + MAP FOUNDATION

### Objective
Build the complete application layout shell and an interactive dark-themed GIS map with village selection. Having the full layout early means every subsequent level has a real home to plug into.

### Planning Step
Before code: sketch the three-panel layout in ASCII, list every component you will create, identify the Leaflet dark theme approach.

### Tasks — Layout Shell

1. Create `frontend/src/layouts/AppLayout.tsx`:
   ```
   ┌──────────────────────────────────────────────────────────────┐
   │ Header (56px): wordmark | village name | year selector       │
   ├──────────────┬───────────────────────┬──────────────────────┤
   │              │                       │                      │
   │   Sidebar    │     Map (Leaflet)     │  Dashboard Panel     │
   │   280px      │     ~50% width        │  ~30% width          │
   │              │                       │                      │
   │ Village list │                       │ [Tab content here]   │
   │ Weather      │                       │                      │
   │ Quick stats  │                       │                      │
   │              │                       │                      │
   └──────────────┴───────────────────────┴──────────────────────┘

   Mobile (<768px): stacked — map full screen, dashboard as bottom sheet
   Tablet (768-1200px): map full width top, dashboard below
   Desktop (>1200px): 3-panel as above
   ```

2. Create `frontend/src/components/layout/Header.tsx`:
   - Left: "GRAMDRISHTI" in Space Grotesk 24px/700 + "ग्रामदृष्टि" in smaller mint text
   - Center: selected village name + district (empty state: "Select a village")
   - Right: year selector (custom dropdown, not native select) + settings icon (Lucide)
   - Height: 56px, background #131313, border-bottom 1px solid #2d2d2d

3. Create `frontend/src/components/layout/Sidebar.tsx`:
   - Village list with inline search filter
   - Each item: village name (Space Grotesk), district (Space Mono UPPERCASE), health score placeholder badge
   - Selected: left border #3cffd0, background #1a1a1a
   - Hover: border #2d2d2d → #309875
   - Collapsible on mobile (hamburger toggle)

4. Create `frontend/src/components/dashboard/DashboardPanel.tsx`:
   - Tabbed interface, tabs as Space Mono UPPERCASE pills
   - Tabs: OVERVIEW | ENVIRONMENT | HISTORY | AI ANALYST | REPORT
   - Active tab: mint underline + white text
   - Inactive: gray text
   - Tab content area: independently scrollable
   - Placeholder content in each tab: "Coming in Level N…" text

5. Create `frontend/src/components/dashboard/EmptyState.tsx`:
   - Shows when no village is selected
   - Centered in dashboard panel
   - Mint map-pin icon (Lucide), "Select a village" heading, gray subtext
   - Not a wall of text — minimal and purposeful

### Tasks — Map

6. Create `frontend/src/components/map/MapContainer.tsx`:
   - Dark CartoDB tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
   - Center: `[20.5937, 78.9629]` (India)
   - Zoom: 5 initial, min 4, max 16
   - Attribution: minimal, styled gray text
   - Wraps all other map components as children

7. Create `frontend/src/components/map/VillageMarker.tsx`:
   - Custom Leaflet DivIcon (SVG-based, not default pin)
   - Default: #3cffd0 dot, 10px, pulsing CSS animation
   - Selected: 16px dot + ring
   - Hover tooltip: village name in English + Hindi
   - Click: calls `onVillageSelect(village)`

8. Create `frontend/src/components/map/VillageBoundary.tsx`:
   - GeoJSON polygon
   - Default: stroke #3cffd0 weight 2, fill #3cffd0 opacity 0.08
   - Hover: fill opacity 0.15
   - Selected: fill opacity 0.12, stroke weight 3
   - Disappears when village deselected

9. Create `frontend/src/components/map/VillagePopup.tsx`:
   - Mini card on marker click (before full dashboard loads)
   - Village name, district, area km², "View Analysis" button
   - Styled as dark card (#1a1a1a) with mint border, not default Leaflet popup

10. Create `frontend/src/components/map/LayerControl.tsx`:
    - Position: top-right, custom styled (no default Leaflet control)
    - Toggles: Dark tiles | Satellite (ESRI World Imagery) | OSM
    - NDVI overlay toggle (wired in Level 4)
    - Water layer toggle (wired in Level 4)
    - Background #1a1a1a, border #2d2d2d

11. Create `frontend/src/components/map/MapControls.tsx`:
    - Custom zoom in/out (not default Leaflet)
    - Reset view button
    - Styled: background #1a1a1a, border #2d2d2d, icon #ffffff
    - Hover: border → #3cffd0

12. Create `frontend/src/components/map/VillageSearch.tsx`:
    - Input: top-left on map, #1a1a1a background, #2d2d2d border, white text
    - Filters by English name and Hindi name
    - Dropdown results: hover highlight #3cffd0
    - On select: map `flyTo()` village + select it

### Tasks — State + Hooks

13. Create `frontend/src/hooks/useVillageSelection.ts`:
    - Manages: `selectedVillage`, `setSelectedVillage`, `flyToVillage`
    - Triggers data fetch when village changes
    - Provides `clearSelection()`

14. Create `frontend/src/hooks/useMapLayers.ts`:
    - Manages active tile layer state
    - Manages overlay toggle states (ndvi, water, landcover)

15. Create `frontend/src/constants/villages.ts` — 5 real Maharashtra villages with verified coordinates and approximate GeoJSON boundaries:
    - Mulshi (Pune) — `[18.5204, 73.5297]`
    - Maval (Pune) — `[18.7667, 73.5833]`
    - Ambegaon (Pune) — `[19.1167, 73.7167]`
    - Khed (Pune) — `[18.8333, 73.8667]`
    - Junnar (Pune) — `[19.2000, 73.8833]`
    
    All boundaries must be real approximate polygons (not bounding boxes). Look up and use actual taluka boundary shapes.

### Backend — Villages API

16. Update `backend/app/api/routes/villages.py`:
    - `GET /api/v1/villages` — list all villages
    - `GET /api/v1/villages/{village_id}` — single village
    - `GET /api/v1/villages/{village_id}/boundary` — GeoJSON boundary only
    All responses typed with Pydantic models.

17. Create `backend/app/services/village_service.py`:
    - `get_all_villages() -> list[Village]`
    - `get_village_by_id(village_id: str) -> Village | None`
    - `get_village_boundary(village_id: str) -> dict | None`

### LEVEL 2 AUDIT CHECKLIST
```
□ Three-panel layout renders correctly at 1440px
□ Header shows wordmark + Hindi subtitle + year selector
□ Sidebar shows all 5 villages, search filter works
□ Dashboard panel shows 5 tabs, switching works
□ Empty state renders when no village selected
□ Dark CartoDB tiles loading correctly
□ All 5 village markers visible on India map
□ Clicking marker selects village
□ Village boundary polygon renders on selection
□ Boundary disappears on deselection
□ Layer control switches tile providers
□ Custom zoom controls styled per design system
□ Village search filters by English and Hindi name
□ Search result click flies map to village and selects it
□ Village popup appears on marker click (not default Leaflet popup)
□ All map controls are custom-styled (zero default Leaflet gray controls visible)
□ No Leaflet console warnings
□ Responsive: layout correct at 375px, 768px, 1024px, 1440px
□ No horizontal scroll at any viewport
□ Skeleton component renders in each tab placeholder
□ GEEProgress component renders (test it manually in one tab)
□ All Framer Motion animations smooth
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
□ Village API endpoints returning typed data
□ GeoJSON boundaries are valid and render correctly
```

---

## LEVEL 3 — GOOGLE EARTH ENGINE INTEGRATION

### Objective
Authenticate with GEE and retrieve real satellite data for selected villages. Backend only — no frontend changes except wiring GEEProgress.

### Planning Step
Before code: describe the GEE call sequence, how you will structure the `ee.Geometry` conversion, and how caching integrates with the service layer.

### Tasks

1. Create `backend/credentials/` directory. Add to `.gitignore`. Place GEE service account JSON here.

2. Create `backend/app/services/gee/auth.py`:
   ```python
   """
   Google Earth Engine authentication using service account credentials.
   Called once at application startup.
   """
   import ee
   from pathlib import Path
   from app.core.config import settings
   from app.core.logging import get_logger

   logger = get_logger(__name__)

   def initialize_gee() -> None:
       """
       Initialize GEE with service account credentials.
       Skips initialization if USE_MOCK_DATA is True.
       Raises RuntimeError on auth failure (startup should fail loudly).
       """
       if settings.USE_MOCK_DATA:
           logger.info("Mock mode enabled — skipping GEE initialization")
           return
       credentials_path = Path(settings.GEE_CREDENTIALS_PATH)
       if not credentials_path.exists():
           raise RuntimeError(f"GEE credentials not found at {credentials_path}")
       credentials = ee.ServiceAccountCredentials(
           settings.GEE_SERVICE_ACCOUNT_EMAIL,
           str(credentials_path)
       )
       ee.Initialize(credentials, project=settings.GEE_PROJECT_ID)
       logger.info("Google Earth Engine initialized successfully")
   ```

3. Call `initialize_gee()` in `main.py` startup event.

4. Create `backend/app/services/gee/geometry.py`:
   ```python
   """
   GeoJSON ↔ Earth Engine geometry conversion utilities.
   """
   import ee
   from shapely.geometry import shape, mapping

   def geojson_to_ee_geometry(geojson_polygon: dict) -> ee.Geometry:
       """Convert a GeoJSON Polygon dict to ee.Geometry.Polygon."""

   def ee_geometry_to_geojson(ee_geometry: ee.Geometry) -> dict:
       """Convert ee.Geometry back to GeoJSON for storage/caching."""

   def validate_geometry(geojson: dict) -> bool:
       """Validate that a GeoJSON polygon is well-formed and non-self-intersecting."""
   ```

5. Create `backend/app/services/gee/sentinel2.py`:
   ```python
   """
   Sentinel-2 Surface Reflectance (COPERNICUS/S2_SR_HARMONIZED) retrieval.
   Provides NDVI, NDWI, and band statistics for a village boundary.
   """
   import ee
   from app.services.gee.geometry import geojson_to_ee_geometry
   from app.core.logging import get_logger

   logger = get_logger(__name__)

   def get_sentinel2_metrics(boundary: dict, year: int, cloud_cover_max: int = 20) -> dict[str, float]:
       """
       Retrieve cloud-free Sentinel-2 median composite for a village boundary.

       NDVI = (B8 - B4) / (B8 + B4)
       NDWI = (B3 - B8) / (B3 + B8)

       Args:
           boundary: GeoJSON Polygon dict
           year: Target year (2022-2026)
           cloud_cover_max: Maximum cloud cover percentage filter

       Returns:
           {"ndvi_mean": float, "ndwi_mean": float, "red_mean": float,
            "nir_mean": float, "swir_mean": float}

       Raises:
           GEETimeoutError: If computation exceeds 120 seconds
           GEEDataError: If no imagery available for region/year
       """
   ```

6. Create `backend/app/services/gee/dynamic_world.py`:
   ```python
   """
   Dynamic World (GOOGLE/DYNAMICWORLD/V1) land cover retrieval.
   Returns area percentage for each of 9 land cover classes.
   """
   def get_land_cover(boundary: dict, year: int) -> dict[str, float]:
       """
       Classes: water, trees, grass, flooded_vegetation, crops,
                shrub_and_scrub, built, bare, snow_and_ice
       Returns area percentage for each class (should sum to ~100%).
       """
   ```

7. Create `backend/app/services/gee/terrain.py`:
   ```python
   """
   SRTM DEM (USGS/SRTMGL1_003) terrain analysis.
   Year-independent — terrain doesn't change.
   """
   def get_terrain_metrics(boundary: dict) -> dict[str, float]:
       """
       Returns:
           mean_elevation_m: float
           slope_mean_degrees: float
           slope_std_degrees: float
           flood_risk_area_percent: float  # % of area with slope < 2°
       """
   ```

8. Create `backend/app/services/gee/water.py`:
   ```python
   """
   JRC Global Surface Water (JRC/GSW1_4/GlobalSurfaceWater) analysis.
   Combined with Sentinel-2 NDWI for comprehensive water assessment.
   """
   def get_water_metrics(boundary: dict, year: int) -> dict[str, float]:
       """
       Returns:
           water_area_ha: float
           water_coverage_percent: float
           seasonal_water_months: float  # avg months/year with water
           water_occurrence_mean: float  # 0-100 JRC occurrence score
       """
   ```

9. Create `backend/app/services/gee/processor.py`:
   ```python
   """
   Orchestrates all GEE data retrieval for a village+year.
   Checks cache first. Handles retries and timeouts.
   """
   import asyncio
   import time
   from app.utils.cache import cache
   from app.core.logging import get_logger

   logger = get_logger(__name__)

   async def get_all_gee_metrics(village_id: str, boundary: dict, year: int) -> dict:
       """
       Retrieve all GEE metrics for a village and year.
       Cache key: {village_id}_{year}_all
       TTL: 86400 seconds (24 hours)
       Runs Sentinel, DynamicWorld, Water, Terrain in parallel where possible.
       Logs start time, end time, duration.
       Falls back to mock data if USE_MOCK_DATA=True.
       """

   async def _call_with_retry(fn, *args, max_retries: int = 3) -> dict:
       """
       Retry wrapper with exponential backoff: 2s, 4s, 8s.
       Raises GEETimeoutError after all retries exhausted.
       """
   ```

10. Create `backend/app/core/exceptions.py`:
    ```python
    class GEETimeoutError(Exception): ...
    class GEEDataError(Exception): ...
    class VillageNotFoundError(Exception): ...
    class InvalidYearError(Exception): ...
    ```
    Wire these to FastAPI exception handlers returning appropriate HTTP status codes.

11. Create `backend/app/models/satellite.py` — Pydantic v2 models for all GEE responses.

12. Create `backend/app/api/routes/satellite.py`:
    ```
    GET /api/v1/satellite/{village_id}/metrics?year=2024
    GET /api/v1/satellite/{village_id}/ndvi?year=2024
    GET /api/v1/satellite/{village_id}/water?year=2024
    GET /api/v1/satellite/{village_id}/landcover?year=2024
    GET /api/v1/satellite/{village_id}/terrain
    ```
    All: validate village_id (404 if unknown), validate year (422 if not 2022-2026).

13. Frontend: update any GEE-dependent component to show `GEEProgress` while loading. Wire `dataSource: 'live' | 'cached' | 'mock'` into the progress indicator.

### LEVEL 3 AUDIT CHECKLIST
```
□ GEE initializes successfully on backend startup (check logs)
□ Mock mode correctly skips GEE init when USE_MOCK_DATA=true
□ credentials/ directory is gitignored
□ GeoJSON → ee.Geometry conversion works without error
□ Sentinel-2 endpoint returns NDVI in range [-1, 1]
□ Sentinel-2 endpoint returns NDWI in range [-1, 1]
□ Dynamic World endpoint returns 9 land cover classes summing to ~100%
□ Terrain endpoint returns valid elevation and slope values
□ Water endpoint returns water_area_ha > 0 for water-containing villages
□ Cache hit on second request (verify via logs: "Cache HIT" message)
□ Cache miss on first request (verify via logs: "Cache MISS" message)
□ GEE call duration logged for every request
□ Timeout after 120 seconds returns 504 with informative message
□ 3 retry attempts with correct backoff (2s, 4s, 8s) — verify via logs
□ Unknown village_id returns 404
□ Year outside 2022-2026 returns 422
□ All endpoints have Pydantic response models
□ All satellite endpoints visible in FastAPI /docs
□ All Python type hints present
□ All functions have docstrings
□ GEEProgress component shows on frontend during live GEE call
□ No hardcoded credentials anywhere in source
□ No TypeScript errors
□ No ESLint warnings
```

---

## LEVEL 4 — ENVIRONMENTAL ANALYSIS ENGINE

### Objective
Transform raw GEE values into interpreted environmental metrics. Display NDVI, water, and land cover overlays on the map.

### Planning Step
Before code: define exactly what inputs each scoring function receives, and what output range each produces. Write these out before implementing.

### Tasks — Backend

1. Create `backend/app/services/scoring/environmental.py`:
   ```python
   """
   Environmental metrics interpreter.
   Transforms raw GEE values into normalized, human-readable scores and categories.
   All functions return dicts with at minimum: value, category, description.
   All output values are validated against expected ranges before return.
   """

   def interpret_ndvi(ndvi_mean: float) -> dict:
       """
       NDVI health interpretation.
       > 0.6:  Dense vegetation (excellent) → category "excellent"
       0.4-0.6: Moderate vegetation → category "good"
       0.2-0.4: Sparse vegetation → category "fair"
       < 0.2:  Bare/degraded → category "poor"
       Returns: {value, category, description, percent_healthy_vegetation}
       """

   def interpret_water_stress(ndwi: float, water_area_ha: float, village_area_km2: float) -> dict:
       """
       Returns: {stress_level, water_coverage_percent, assessment}
       Handles zero-water villages: stress_level "critical", coverage 0.0
       """

   def calculate_green_cover(land_cover: dict) -> float:
       """
       Green cover = trees + grass + crops + shrub_and_scrub (all in percent)
       Validated: output always 0.0–100.0
       """

   def assess_flood_risk(terrain: dict, land_cover: dict, annual_rainfall_mm: float) -> dict:
       """
       Flood risk combines: slope < 2° area, flooded_vegetation %, rainfall intensity.
       Returns: {risk_level: "low"|"medium"|"high"|"critical", risk_score: float, explanation: str}
       """
   ```

2. Create `backend/app/services/scoring/aggregator.py`:
   - Merges Sentinel-2 + Dynamic World + Terrain + Water into one `EnvironmentalMetrics` object
   - Handles partial failures: if one GEE dataset fails, populate with `None` + set `dataSource` to indicate incomplete
   - Validates all output values: no NaN, no Infinity, no out-of-range values
   - Returns fully typed Pydantic model

3. Update `GET /api/v1/satellite/{village_id}/metrics` to return full `EnvironmentalMetrics` via aggregator.

4. Create `backend/app/api/routes/analysis.py`:
   ```
   GET /api/v1/analysis/{village_id}/environmental?year=2024
   GET /api/v1/analysis/{village_id}/summary?year=2024
   ```

### Tasks — Frontend Map Overlays

5. Create `frontend/src/components/map/NDVILayer.tsx`:
   - Renders colored GeoJSON overlay on village boundary
   - Color by NDVI category: excellent #166534, good #16a34a, fair #ca8a04, poor #dc2626
   - Shows `GEEProgress` while fetching

6. Create `frontend/src/components/map/WaterLayer.tsx`:
   - Overlay: #3cffd0 fill, 60% opacity
   - Tooltip: water area in hectares

7. Create `frontend/src/components/map/LandCoverLayer.tsx`:
   - Color-coded per class: crops #ca8a04, trees #166534, water #3cffd0, built #6b7280, grass #86efac, bare #a16207, flooded #3860be

8. Create `frontend/src/components/map/NDVILegend.tsx` — bottom-left on map, small dark card, NDVI color scale with labels.

9. Wire `LayerControl.tsx` toggles to NDVI, Water, Land Cover layer components.

10. Create `frontend/src/hooks/useSatelliteData.ts`:
    - TanStack Query hook
    - `staleTime: 30 * 60 * 1000` (30 min client-side cache)
    - Loading, error, and success states exposed
    - Returns `GEEStatus` alongside data

11. Create `frontend/src/components/dashboard/MetricsPanel.tsx`:
    - 6 metric cards: NDVI, NDWI, Water Area, Green Cover %, Temperature, Rainfall
    - Each: metric name (Space Mono UPPERCASE), value, unit, trend arrow, colored left border
    - Left border color per metric: vegetation metrics #166534, water metrics #3860be, climate metrics #f59e0b
    - Loading: Skeleton component
    - Error: "Metric unavailable" in muted text, not a crash

### LEVEL 4 AUDIT CHECKLIST
```
□ Environmental metrics endpoint returns valid EnvironmentalMetrics
□ NDVI interpreted into correct category for all 4 ranges
□ Water stress handles zero-water villages (no division by zero)
□ Green cover sums only the correct land cover classes
□ Flood risk returns valid risk_level strings
□ No NaN, Infinity, or out-of-range values in any output
□ Partial GEE failures handled gracefully (None fields, not crashes)
□ NDVI overlay renders on village boundary when toggled
□ NDVI colors match specification (four distinct colors)
□ Water overlay renders with mint fill
□ Land cover overlay renders with correct per-class colors
□ NDVILegend renders bottom-left
□ LayerControl toggles wire to correct overlay components
□ MetricsPanel shows 6 cards with correct values and units
□ MetricsPanel skeleton shows while fetching
□ MetricsPanel shows "unavailable" gracefully on error (no crash)
□ GEEProgress shows during live GEE calls
□ TanStack Query cache working (no duplicate requests in network tab)
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
□ Overlay toggling doesn't degrade map performance
```

---

## LEVEL 5 — WEATHER ENGINE

### Objective
Integrate Open-Meteo (free, no API key) for current and historical weather. Merge into EnvironmentalMetrics.

### Planning Step
Before code: define the exact Open-Meteo API parameters for both `/forecast` and `/archive` endpoints. Verify these against the Open-Meteo docs before writing the service.

### Tasks

1. Create `backend/app/services/weather/openmeteo.py`:
   ```python
   """
   Open-Meteo API integration. Free, no API key.
   Docs: https://open-meteo.com/en/docs
   Uses httpx async client. All calls timeout at 30 seconds.
   """
   import httpx
   from app.core.config import settings

   async def get_current_weather(lat: float, lon: float) -> dict:
       """
       Params: latitude, longitude
       Current vars: temperature_2m, relative_humidity_2m,
                     precipitation, wind_speed_10m, weather_code
       Timezone: Asia/Kolkata
       Returns: {temperature_c, rainfall_mm, humidity_percent, wind_speed_kmh, weather_code}
       """

   async def get_historical_annual(lat: float, lon: float, year: int) -> dict:
       """
       Uses /archive endpoint.
       Date range: {year}-01-01 to {year}-12-31
       Daily vars: temperature_2m_max, temperature_2m_min, precipitation_sum
       Returns: {annual_rainfall_mm, mean_temp_c, max_temp_c, dry_days_count}
       """
   ```

2. Create `backend/app/services/weather/analysis.py`:
   ```python
   # Maharashtra district normal annual rainfall reference (IMD data)
   DISTRICT_NORMAL_RAINFALL_MM = {
       "Pune": 722, "Nashik": 681, "Kolhapur": 1672, "Satara": 1050,
       "Solapur": 553, "Aurangabad": 657, "Nagpur": 1034, "Amravati": 848,
       # Add all Maharashtra districts
   }

   def assess_rainfall_adequacy(annual_rainfall_mm: float, district: str) -> dict:
       """
       Compare against IMD district normal.
       Returns: {adequacy: "deficit"|"normal"|"surplus", percent_of_normal: float, deviation_mm: float}
       """

   def calculate_heat_index(temp_c: float, humidity_percent: float) -> float:
       """
       Steadman heat index formula.
       Returns heat index in Celsius.
       """

   def assess_heat_stress(temp_c: float, humidity_percent: float) -> dict:
       """
       Returns: {heat_index_c, risk_level: "low"|"moderate"|"high"|"extreme", affected_crops: list[str]}
       """

   def assess_drought_risk(annual_rainfall_mm: float, ndvi: float, district: str) -> dict:
       """
       Combined: rainfall deficit + vegetation stress.
       Returns: {risk_level, explanation}
       """
   ```

3. Create `backend/app/api/routes/weather.py`:
   ```
   GET /api/v1/weather/{village_id}/current
   GET /api/v1/weather/{village_id}/historical?year=2024
   GET /api/v1/weather/{village_id}/assessment
   ```

4. Update `aggregator.py` to merge weather into `EnvironmentalMetrics`.

5. Frontend — update `MetricsPanel.tsx`:
   - Add weather section with 4 cards: Temperature, Rainfall, Humidity, Wind
   - Weather cards: left border #3860be
   - Current weather: refetch every 10 minutes (`refetchInterval: 10 * 60 * 1000`)

6. Create `frontend/src/components/dashboard/WeatherWidget.tsx`:
   - Compact: Lucide weather icon + temperature + rainfall
   - "Last updated" timestamp in Space Mono
   - Lives in sidebar below village list

7. Create `frontend/src/components/dashboard/ClimateAssessment.tsx`:
   - Rainfall adequacy bar: left=deficit (#ef4444), center=normal (#3cffd0), right=surplus (#3860be)
   - Heat stress badge
   - Drought risk badge

### LEVEL 5 AUDIT CHECKLIST
```
□ Open-Meteo returns current weather for all 5 villages
□ Historical weather returns annual summary for 2022-2026
□ Timezone is Asia/Kolkata throughout
□ Rainfall adequacy uses correct district reference values
□ Heat index uses Steadman formula (not simplified approximation)
□ Drought risk correctly combines rainfall and NDVI
□ All weather API calls are async httpx (not blocking)
□ Weather errors handled (Open-Meteo downtime returns 503 with message)
□ Current weather cached 10 minutes, historical cached 24 hours
□ MetricsPanel weather section shows correct values and units
□ WeatherWidget in sidebar displays and auto-refreshes
□ ClimateAssessment renders all three indicators
□ All units labeled correctly (°C, mm, %, km/h)
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
```

---

## LEVEL 6 — VILLAGE HEALTH SCORE ENGINE

### Objective
Calculate a composite Village Health Score (0–100) from all environmental and weather metrics with per-component breakdown and trend.

### Planning Step
Before code: write out the complete scoring formula on paper (or in a comment block) for each of the 5 components. Verify weights sum to 1.0. Verify each formula cannot produce values outside 0–100 before writing Python.

### Tasks

1. Create `backend/app/services/scoring/health_score.py`:
   ```python
   """
   Village Health Score Calculator.

   Component weights (must sum to 1.0):
     Water Security:      0.25
     Vegetation Health:   0.25
     Climate Stability:   0.20
     Flood Preparedness:  0.15
     Land Sustainability: 0.15

   Each component scored 0-100 before weighting.
   All formulas validated: cannot produce values < 0 or > 100.
   """

   WEIGHTS = {
       "water": 0.25,
       "vegetation": 0.25,
       "climate": 0.20,
       "flood": 0.15,
       "land": 0.15,
   }
   assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9, "Weights must sum to 1.0"

   def calculate_water_score(metrics: EnvironmentalMetrics) -> ScoreDetail:
       """
       Water Security Score (0-100).
       Formula:
         water_coverage = min((water_area_ha / (village_area_km2*100)) * 500, 40)
         ndwi_score     = max(0, min((ndwi + 1) / 2 * 100, 30))
         rainfall_score = min(annual_rainfall_mm / 800 * 30, 30)
         total = water_coverage + ndwi_score + rainfall_score  → clamped to [0, 100]
       Trend: compared to previous year's ScoreDetail if available.
       """

   def calculate_vegetation_score(metrics: EnvironmentalMetrics) -> ScoreDetail:
       """
       Vegetation Health Score (0-100).
       Formula:
         ndvi_score        = max(0, min(ndvi * 100, 50))
         green_cover_score = min(green_cover_percent / 60 * 30, 30)
         tree_score        = min(land_cover.trees / 30 * 20, 20)
         total = ndvi_score + green_cover_score + tree_score  → clamped to [0, 100]
       """

   def calculate_climate_score(metrics: EnvironmentalMetrics) -> ScoreDetail:
       """
       Climate Stability Score (0-100). Start at 100, apply penalties:
         temperature > 40°C: -20
         rainfall deficit > 30%: -25
         heat stress "high": -15
         heat stress "extreme": -30
         drought risk "high": -20
       Final: clamp to [0, 100]
       """

   def calculate_flood_score(metrics: EnvironmentalMetrics) -> ScoreDetail:
       """
       Flood Preparedness Score (0-100).
       Higher score = LOWER flood risk.
       Start at 100, apply penalties:
         flood_risk_area_percent > 30%: -30
         land_cover.flooded > 5%: -20
         annual_rainfall > 1500mm AND slope_mean < 3°: -25
       Final: clamp to [0, 100]
       """

   def calculate_land_score(metrics: EnvironmentalMetrics) -> ScoreDetail:
       """
       Land Sustainability Score (0-100). Start at 100, apply penalties:
         bare_land > 20%: -20
         built_area > 15%: -15
         cropland < 10% AND green_cover < 20%: -15
       Final: clamp to [0, 100]
       """

   def calculate_overall_score(components: dict[str, ScoreDetail]) -> VillageHealthScore:
       """
       Weighted average using WEIGHTS.
       Also determines trend: compare to previous year if available.
       """
   ```

2. Create `backend/app/api/routes/scores.py`:
   ```
   GET /api/v1/scores/{village_id}?year=2024
   GET /api/v1/scores/{village_id}/component/{component}?year=2024
   GET /api/v1/scores/{village_id}/trend?years=2022,2023,2024
   ```

3. Create `backend/tests/test_health_score.py`:
   - Test each scoring function with: zero input, max input, typical input
   - Assert all outputs are in [0, 100]
   - Assert weights sum to 1.0
   - Assert trend calculation is correct for improving/stable/declining cases
   Run: `python -m pytest backend/tests/ -v`

### Frontend — Score Visualization

4. Create `frontend/src/components/dashboard/HealthScoreRing.tsx`:
   - SVG, 120×120px, stroke-width 8px
   - Background ring: #2d2d2d
   - Score ring: color from score range
   - Center: score number (Space Grotesk 32px/700) + "/100" (14px/400)
   - Framer Motion: ring animates from 0 → score on mount
   - Loading: Skeleton ring

5. Create `frontend/src/components/dashboard/ScoreBreakdown.tsx`:
   - 5 component bars (full width)
   - Each: name (Space Mono UPPERCASE), colored progress bar, score number, trend indicator ↑→↓
   - Trend colors: mint/gray/red
   - Explanation text: Space Grotesk 13px gray

6. Create `frontend/src/components/dashboard/TrendBadge.tsx`:
   - "IMPROVING ↑" / "STABLE →" / "DECLINING ↓"
   - Colors: mint/gray/red
   - Space Mono UPPERCASE

7. Create `frontend/src/components/dashboard/ScoreCard.tsx`:
   - Combines: `HealthScoreRing` + `ScoreBreakdown`
   - Header: "VILLAGE HEALTH SCORE" in Space Mono UPPERCASE with mint dot

### LEVEL 6 AUDIT CHECKLIST
```
□ All 5 scoring functions produce values in [0, 100] for all inputs
□ Weights sum to exactly 1.0 (assert in code)
□ Climate score penalties cannot drive score below 0
□ Flood score correctly interprets higher = safer
□ Trend calculates correctly for improving/stable/declining
□ All score explanations are human-readable English sentences
□ All unit tests pass: pytest backend/tests/test_health_score.py
□ Score endpoints return correct Pydantic models
□ HealthScoreRing renders with correct color for all 4 score ranges
□ Ring animation plays on mount
□ ScoreBreakdown shows all 5 components with correct trend indicators
□ TrendBadge shows correct direction and color
□ ScoreCard composes correctly
□ Loading skeleton renders for ring and breakdown
□ Error state shows message (no crash)
□ Score endpoints cached (TTL: indefinite per year — scores don't change)
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
```

---

## LEVEL 7 — HISTORICAL CHANGE DETECTION

### Objective
Year-over-year comparison (2022–2026) with interactive timeline, trend charts, and change statistics.

### Planning Step
Before code: decide how historical data fetching will work — parallel year fetches or sequential? How will year switching update all downstream components simultaneously?

### Tasks

1. Create `backend/app/services/scoring/history.py`:
   ```python
   def get_historical_data(village_id: str, years: list[int]) -> HistoricalData:
       """
       Retrieve metrics and scores for multiple years.
       Uses cached GEE data heavily — these calls should be fast on warm cache.
       """

   def calculate_change_statistics(historical: HistoricalData) -> dict:
       """
       Returns:
         ndvi_changes: list of {year, value, delta_from_previous}
         water_area_changes: list of {year, value_ha, delta_ha}
         green_cover_changes: list of {year, value_percent, delta_percent}
         score_changes: list of {year, overall, delta}
         best_year: int
         worst_year: int
         overall_trend: "improving" | "stable" | "declining"
         top_changes: list of top 3 most significant changes with descriptions
       """
   ```

2. Create `backend/app/api/routes/history.py`:
   ```
   GET /api/v1/history/{village_id}
   GET /api/v1/history/{village_id}/changes
   GET /api/v1/history/{village_id}/compare?year1=2022&year2=2024
   ```

### Frontend — Timeline and Charts

3. Create `frontend/src/components/dashboard/TimelineSlider.tsx`:
   - 5 year stops: 2022 | 2023 | 2024 | 2025 | 2026
   - Active year: mint highlight, bold
   - Sliding: updates map overlays + metrics + scores simultaneously
   - Framer Motion transition between years
   - Year labels: Space Mono UPPERCASE

4. Create `frontend/src/hooks/useHistoricalData.ts`:
   - TanStack Query for historical data
   - Manages `selectedYear` state
   - `setYear(year)` triggers update to all data-dependent hooks
   - Pre-fetches adjacent years for smooth slider experience

5. Create `frontend/src/components/charts/NDVITrendChart.tsx`:
   - ECharts line chart
   - X: years 2022–2026, Y: NDVI 0–1
   - Line: #3cffd0, area fill #3cffd0 at 10% opacity
   - Background: #131313, grid: #2d2d2d
   - Tooltip: Space Mono styled dark card

6. Create `frontend/src/components/charts/WaterTrendChart.tsx`:
   - ECharts bar chart, water area (ha) per year
   - Bar: #3860be, loss years highlighted #ef4444

7. Create `frontend/src/components/charts/HealthScoreTrendChart.tsx`:
   - ECharts line chart, overall score per year
   - Line color changes by score range
   - Reference line: Maharashtra avg (65) in dashed gray
   - Label: "MH AVERAGE" in Space Mono

8. Create `frontend/src/components/charts/LandCoverChart.tsx`:
   - ECharts stacked bar or donut (choose whichever is clearer for this data)
   - Land cover breakdown for selected year
   - Colors per design system

9. Create `frontend/src/components/dashboard/ChangeDetection.tsx`:
   - Top 3 biggest changes from `change_statistics.top_changes`
   - Each: what changed, how much, color-coded direction
   - Mint for improvement, red for decline, gray for stable

10. All charts must:
    - Use `#131313` background, `#2d2d2d` grid lines
    - Resize with window (ECharts `resize` on `window.resize`)
    - Show Skeleton while loading
    - Show "Data unavailable" on error

### LEVEL 7 AUDIT CHECKLIST
```
□ Historical API returns data for all 5 years
□ Change statistics calculate year-over-year deltas correctly
□ Best/worst year identified correctly
□ Top 3 changes identified by magnitude
□ Timeline slider shows 5 year stops
□ Selecting year updates: map overlays, metrics, score simultaneously
□ NDVI trend chart renders with correct data and mint color
□ Water trend chart shows loss years in red
□ Health score trend chart shows reference line at 65
□ Land cover chart shows correct breakdown for selected year
□ Change detection shows correct top 3 changes with correct direction
□ All charts use dark background (#131313) and design system colors
□ All charts resize correctly with window
□ Year transition animated with Framer Motion
□ All chart skeletons show while loading
□ Adjacent year pre-fetching working (smooth slider)
□ ECharts no console warnings
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
□ Historical data cached per village+year (not re-fetched on slider drag)
```

---

## LEVEL 8 — AI VILLAGE ANALYST

### Objective
Integrate Gemini 1.5 Flash (primary) and Ollama Qwen2.5 (fallback) for village summaries, recommendations, and Q&A.

### Planning Step
Before code: write the system prompt and context builder as plain text first. Review: does the context contain only processed metrics (no raw numbers the AI can't interpret)? Is the system prompt specific enough to prevent hallucination?

### Tasks

1. Create `backend/app/services/ai/prompt_builder.py`:
   ```python
   """
   Builds structured prompts from processed village metrics.
   CRITICAL: Only pass human-readable interpreted values to the AI.
   Never pass raw band values, raw GEE outputs, or unexplained numbers.
   """

   SYSTEM_PROMPT = """
   You are GramDrishti's AI Village Analyst — an expert in rural environmental
   health, Indian agriculture, climate adaptation, and Gram Panchayat governance.

   You analyze environmental data for Indian villages and provide:
   1. Clear explanations that farmers and Gram Panchayat members can understand
   2. Specific, actionable recommendations implementable at village level
   3. References to relevant Indian government schemes when appropriate
      (MGNREGA, PMKSY, Jal Jeevan Mission, PM-KUSUM, PMFBY, etc.)
   4. Comparison with historical trends when data is available

   Rules:
   - Write in simple, plain English. No technical jargon.
   - Never invent, guess, or extrapolate data not provided in the context.
   - If the context does not contain a value, say so rather than assuming.
   - Keep responses focused and actionable.
   - Responses must reference only the village and year provided in context.
   """

   def build_village_context(village, metrics, score, historical_summary=None) -> str:
       """
       Build human-readable context string.
       Format: labeled key-value pairs, not raw JSON.
       Include: village name, district, year, all interpreted metrics,
                health scores with labels, trend direction if historical_summary provided.
       Example line: "Vegetation Health: 81/100 (Improving) — NDVI 0.52 (moderate vegetation)"
       """

   def build_summary_prompt(context: str) -> str: ...
   def build_recommendation_prompt(context: str) -> str: ...
   def build_qa_prompt(question: str, context: str) -> str: ...
   def build_report_narrative_prompt(context: str) -> str: ...
   ```

2. Create `backend/app/services/ai/gemini_client.py`:
   ```python
   """
   Google Gemini 1.5 Flash client.
   Async, with 30-second timeout and response validation.
   """
   import google.generativeai as genai

   class GeminiClient:
       model_name = "gemini-1.5-flash-latest"

       async def generate_summary(self, context: str) -> str:
           """2-3 paragraphs. Validated: 100-1500 chars."""

       async def generate_recommendations(self, context: str) -> list[dict]:
           """
           Returns exactly 3 AIRecommendation dicts.
           Prompt instructs JSON-only response.
           Parsed and validated with Pydantic before return.
           """

       async def answer_question(self, question: str, context: str) -> str:
           """Validated: > 20 chars."""

       async def generate_report_narrative(self, context: str) -> str:
           """Full narrative for PDF. 300-2000 chars."""
   ```

3. Create `backend/app/services/ai/ollama_client.py`:
   - Same interface as `GeminiClient`
   - Uses `httpx` POST to `http://localhost:11434/api/generate`
   - Model: `qwen2.5`
   - Falls back gracefully if Ollama not running (returns structured error, not crash)

4. Create `backend/app/services/ai/ai_service.py`:
   - Returns `GeminiClient` if `GEMINI_API_KEY` is set and non-empty
   - Returns `OllamaClient` otherwise
   - Logs which provider is active at startup

5. Create `backend/app/api/routes/ai.py`:
   ```
   POST /api/v1/ai/{village_id}/summary?year=2024
   POST /api/v1/ai/{village_id}/recommendations?year=2024
   POST /api/v1/ai/{village_id}/chat    body: {"question": "..."}
   GET  /api/v1/ai/{village_id}/report-narrative?year=2024
   ```
   - Rate limit: 10 requests/minute per IP (use `slowapi` or manual counter)
   - Summaries/recommendations cached per village+year
   - Chat responses never cached

6. Add AI response validation:
   - Summary: 100-1500 chars, not empty, not a refusal
   - Recommendations: exactly 3 items, all `AIRecommendation` fields populated
   - Answers: > 20 chars

### Frontend — AI Chat Panel

7. Create `frontend/src/components/ai/AIChatPanel.tsx`:
   - User messages: right-aligned, #2d2d2d background, radius 16px 16px 4px 16px
   - AI messages: left-aligned, border 1px solid #309875, radius 16px 16px 16px 4px
   - Typing indicator: 3 dots pulsing in #3cffd0
   - Header: "GRAMDRISHTI AI" Space Mono UPPERCASE + mint dot
   - Input: dark styled, send on Enter or button click
   - Scrolls to bottom on new message

8. Create `frontend/src/components/ai/VillageSummary.tsx`:
   - Auto-loads when village selected
   - Tag: "AI GENERATED SUMMARY" Space Mono UPPERCASE
   - Refresh button (calls API again, shows loading)

9. Create `frontend/src/components/ai/SuggestedQuestions.tsx`:
   - 4 question chips below input
   - "Why did the health score decrease?"
   - "Which areas need intervention?"
   - "Compare vegetation with last year"
   - "Suggest climate adaptation measures"
   - Click: populates input + auto-submits

10. Create `frontend/src/hooks/useAIChat.ts`:
    - Manages conversation history array
    - `sendMessage(question)` → appends user message, calls API, appends AI response
    - `clearConversation()` — resets history
    - Loading and error states

### LEVEL 8 AUDIT CHECKLIST
```
□ Gemini client generates valid summary (100-1500 chars)
□ Gemini recommendations return exactly 3 validated items
□ All AIRecommendation fields populated (no null required fields)
□ Q&A returns relevant, non-hallucinated answers
□ Context builder uses only interpreted values (not raw numbers)
□ System prompt is specific and anti-hallucination
□ Ollama fallback activates when GEMINI_API_KEY is absent
□ Ollama gracefully returns error if not running (no crash)
□ AI provider logged at startup
□ Rate limit: 10 req/min/IP enforced on AI endpoints
□ Summaries/recommendations cached per village+year
□ Chat responses not cached
□ AI timeout: 30 seconds → 504 with message
□ AIChatPanel user/AI message alignment correct
□ Typing indicator shows while AI responds
□ Suggested questions auto-submit on click
□ Village summary auto-loads on village selection
□ Summary refresh works
□ Conversation history maintained during session
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
□ Manual QA: AI content is relevant and appropriate (spot-check 3 questions)
```

---

## LEVEL 9 — COMPLETE DASHBOARD UI

### Objective
Polish the complete dashboard layout into a production-quality interface. Integrate all previous components. Ensure consistency, responsiveness, and animation quality throughout.

### Planning Step
Before code: audit every tab's content. List every component that belongs in each tab. Identify any component built in previous levels that needs style alignment.

### Tasks

1. Complete `frontend/src/layouts/AppLayout.tsx` — wire all layout sections to real components from previous levels.

2. Complete `frontend/src/components/layout/Header.tsx` — year selector dropdown fully functional, wired to `useHistoricalData`.

3. Complete `frontend/src/components/layout/Sidebar.tsx` — village health score badges showing real scores from Level 6.

4. Complete `frontend/src/components/dashboard/DashboardPanel.tsx` — replace all placeholder tab content with real components:

5. Create `frontend/src/components/dashboard/OverviewTab.tsx`:
   - `ScoreCard` (large, centered)
   - Top 2 recommendations preview (from Level 10 — use placeholder if not yet built)
   - Quick weather summary
   - `TrendBadge` for overall village trend

6. Create `frontend/src/components/dashboard/EnvironmentTab.tsx`:
   - Full `MetricsPanel` (10 cards: 6 environmental + 4 weather)
   - NDVI chart + Water chart side by side
   - Land cover chart
   - `ClimateAssessment`

7. Create `frontend/src/components/dashboard/HistoryTab.tsx`:
   - `TimelineSlider` (prominent, full width at top)
   - `HealthScoreTrendChart` (large)
   - `ChangeDetection` cards
   - `NDVITrendChart` + `WaterTrendChart` side by side

8. Create `frontend/src/components/dashboard/AITab.tsx`:
   - `VillageSummary` (top)
   - `AIChatPanel` (main, takes remaining height)
   - `SuggestedQuestions` (inside chat panel)

9. Create `frontend/src/components/dashboard/ReportTab.tsx`:
   - Export buttons (wired in Level 11 — placeholder buttons for now)
   - Report sections preview list
   - "AI Analysis" toggle

10. Loading states: every component shows `Skeleton` while async data loads. No component should be blank or show raw "undefined".

11. Error boundaries: wrap each tab with `ErrorBoundary`. On error: "Analysis temporarily unavailable — try refreshing."

12. Style audit — sweep every component for:
    - No default Leaflet blue/gray anywhere
    - No white or light backgrounds
    - Space Mono used ONLY for labels (never sentences)
    - All borders: #2d2d2d default, #309875 hover, #3cffd0 active
    - No box shadows
    - No gradients
    - Consistent card radius (20px for large cards, 12px for metric cards)

13. Animation audit:
    - All page-level transitions: Framer Motion `AnimatePresence`
    - Tab switches: slide or fade, not instant
    - Score ring: draws in on first mount
    - No conflicting CSS animations vs Framer Motion

14. Responsive sweep:
    - 375px: no horizontal overflow, sidebar is drawer, dashboard is bottom sheet
    - 768px: map full width, dashboard panel below
    - 1024px: 2-panel (sidebar + map+dashboard stacked)
    - 1440px: 3-panel as designed

### LEVEL 9 AUDIT CHECKLIST
```
□ All 5 tabs render with real components (no "Coming soon" placeholders except Report)
□ Header: year selector functional, village name updates on selection
□ Sidebar: health scores visible on village badges
□ Overview tab: ScoreCard + weather + trend badge
□ Environment tab: 10 metric cards + 3 charts + climate assessment
□ History tab: timeline slider + trend charts + change detection
□ AI tab: summary + chat + suggested questions
□ All tab switches are animated
□ Every async component shows Skeleton while loading
□ Every tab has ErrorBoundary
□ Zero light/white backgrounds anywhere
□ Zero default Leaflet blue/gray controls visible
□ Space Mono never used for sentences or paragraphs
□ All card borders consistent with design system
□ No box shadows anywhere
□ No gradients anywhere
□ Score ring animates on mount
□ Layout correct at 375px (no overflow)
□ Layout correct at 768px
□ Layout correct at 1024px
□ Layout correct at 1440px
□ Sidebar is drawer on mobile
□ Dashboard is bottom sheet on mobile
□ All ECharts charts resize on window resize
□ All Framer Motion animations smooth (no jank)
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
```

---

## LEVEL 10 — RECOMMENDATION ENGINE

### Objective
Generate, display, and prioritize AI-powered actionable recommendations with urgency, Indian government scheme references, and expected impact.

### Planning Step
Before code: write 3 example recommendations manually for Mulshi (declining water) to validate your prompt will produce this quality of output. Then build the backend around producing that quality.

### Tasks

1. Update `backend/app/services/ai/gemini_client.py` recommendation prompt to produce this exact JSON schema:
   ```json
   [
     {
       "priority": 1,
       "category": "water",
       "title": "Restore Western Pond Before Monsoon",
       "description": "The western pond has shrunk by 23% since 2022. Desilting and bund reinforcement before June will increase water storage capacity significantly.",
       "scheme": "MGNREGA",
       "expected_impact": "Improved water availability for 200+ households during summer months",
       "timeframe": "4-6 weeks",
       "cost_estimate": "₹2-4 lakh via MGNREGA",
       "urgency": "high"
     }
   ]
   ```

2. Create `backend/app/models/recommendations.py` — Pydantic model validating the above schema strictly.

3. Create `backend/app/services/scoring/risk_ranker.py`:
   ```python
   RISK_THRESHOLDS = {
       "critical": (0, 40),
       "high": (40, 60),
       "medium": (60, 75),
       "low": (75, 100),
   }

   def rank_risks(score: VillageHealthScore) -> list[dict]:
       """
       Rank all 5 components by risk level.
       Returns sorted list: critical first, then high, medium, low.
       Each item: {component, score, risk_level, urgency, one_line_explanation}
       """
   ```

4. Create `backend/app/api/routes/recommendations.py`:
   ```
   GET /api/v1/recommendations/{village_id}?year=2024
   GET /api/v1/recommendations/{village_id}/risks
   ```

### Frontend

5. Create `frontend/src/components/dashboard/RecommendationCard.tsx`:
   - Priority badge: "01" / "02" / "03" in Space Mono — mint / amber / blue
   - Category pill (Space Mono UPPERCASE)
   - Title (Space Grotesk 16px/500)
   - Description (14px gray)
   - Scheme tag if present (e.g. "MGNREGA" pill)
   - "Expected: [impact]" line
   - Timeframe: Space Mono UPPERCASE + Lucide Clock icon
   - Urgency badge: CRITICAL/HIGH/MEDIUM/LOW
   - Left border: red (critical/high) / amber (medium) / mint (low)

6. Create `frontend/src/components/dashboard/RiskDashboard.tsx`:
   - 5 risk indicators (one per component), sorted by risk level
   - Each: component name, risk badge, one-line explanation
   - Critical indicators pulse with red border animation

7. Create `frontend/src/components/dashboard/RecommendationsPanel.tsx`:
   - Header: "AI RECOMMENDATIONS" Space Mono UPPERCASE + mint dot
   - 3 `RecommendationCard` components
   - "Regenerate" button (re-calls AI, shows loading)
   - "Include in Report" checkbox per card
   - Footer: "Powered by Google Gemini" tiny gray text

8. Wire `RecommendationsPanel` into `OverviewTab` (preview top 2) and `AITab` (full panel).

### LEVEL 10 AUDIT CHECKLIST
```
□ Recommendations endpoint returns exactly 3 items
□ All AIRecommendation fields populated including optional cost_estimate
□ Pydantic model rejects malformed AI output
□ Risk ranker produces correct risk levels for all 5 components
□ Priority 1 always has urgency "high" or "critical"
□ Scheme names reference real Indian government schemes
□ RecommendationCard renders all fields
□ Priority 1 border: red for critical/high, mint for low
□ Category pill in Space Mono UPPERCASE
□ Urgency badge shows correct color
□ RiskDashboard sorts by risk level (critical first)
□ Critical indicators show pulsing animation
□ RecommendationsPanel renders all 3 cards
□ Regenerate button triggers new AI call
□ Loading state during AI generation
□ "Include in Report" checkboxes functional (state managed for Level 11)
□ Preview in OverviewTab shows top 2
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
```

---

## LEVEL 11 — REPORTS & EXPORT

### Objective
Generate downloadable PDF reports, JSON exports, and CSV data exports.

### Planning Step
Before code: sketch the PDF layout section by section. Identify what ReportLab components you need. Verify that reportlab is installed and importable in the venv.

### Tasks

1. Create `backend/app/services/reports/pdf_generator.py`:
   ```python
   """
   PDF report generator using ReportLab.
   A4 format, dark professional styling (white background for print compatibility).
   """
   from reportlab.lib.pagesizes import A4
   from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer
   from reportlab.lib.styles import getSampleStyleSheet

   class VillageReportGenerator:
       def generate_pdf(
           self,
           village: Village,
           metrics: EnvironmentalMetrics,
           score: VillageHealthScore,
           recommendations: list[AIRecommendation],
           ai_narrative: str,
           year: int,
           include_ai: bool = True
       ) -> bytes:
           """
           Sections:
           1. Cover: village name, year, GramDrishti branding, generated date
           2. Executive Summary (AI narrative if include_ai=True, else auto-summary)
           3. Village Health Score (table: component, score, trend, explanation)
           4. Environmental Metrics (two-column table)
           5. Historical Trend (text summary of 5-year changes)
           6. Recommendations (numbered, with scheme and timeframe)
           7. Data Sources and Methodology
           Returns PDF bytes.
           """
   ```

2. Create `backend/app/services/reports/json_exporter.py`:
   - Returns complete village data (metrics, score, recommendations, historical) as structured JSON
   - Serialized with Pydantic `.model_dump()`

3. Create `backend/app/services/reports/csv_exporter.py`:
   - Historical metrics as CSV, year columns: 2022, 2023, 2024, 2025, 2026
   - Rows: each metric (NDVI, NDWI, water_area_ha, green_cover, etc.)

4. Create `backend/app/api/routes/reports.py`:
   ```
   GET /api/v1/reports/{village_id}/pdf?year=2024&include_ai=true
   GET /api/v1/reports/{village_id}/json?year=2024
   GET /api/v1/reports/{village_id}/csv
   ```
   All: correct `Content-Type` and `Content-Disposition` headers for file download.

### Frontend

5. Complete `frontend/src/components/dashboard/ReportTab.tsx`:
   - "DOWNLOAD PDF REPORT" (primary mint button)
   - "EXPORT JSON DATA" (secondary)
   - "EXPORT CSV DATA" (secondary)
   - "Include AI Analysis" toggle (wired to `include_ai` param)
   - Download progress: button shows "Generating…" while awaiting
   - Report preview: bullet list of sections included
   - "Last generated" timestamp

6. Create `frontend/src/services/report.service.ts`:
   ```typescript
   export const downloadPDF = async (villageId: string, year: number, includeAI: boolean): Promise<void>
   export const downloadJSON = async (villageId: string, year: number): Promise<void>
   export const downloadCSV = async (villageId: string): Promise<void>
   ```
   Use `axios` with `responseType: 'blob'` and `URL.createObjectURL` for download trigger.

### LEVEL 11 AUDIT CHECKLIST
```
□ PDF generates without errors for all 5 villages
□ PDF contains all 7 sections
□ PDF opens correctly in browser PDF viewer
□ PDF file size < 5MB
□ PDF includes AI narrative when include_ai=true
□ PDF shows auto-summary when include_ai=false
□ JSON export contains all village data, serializable
□ CSV contains historical metrics with correct year columns
□ Content-Type: application/pdf on PDF endpoint
□ Content-Type: application/json on JSON endpoint
□ Content-Type: text/csv on CSV endpoint
□ Content-Disposition headers include correct filename
□ Browser file save triggered (not just opens in tab)
□ PDF button shows "Generating…" during generation
□ Error handling if PDF generation fails (user sees message)
□ "Include AI Analysis" toggle wired correctly
□ No TypeScript errors
□ No ESLint warnings
□ No console errors
```

---

## LEVEL 12 — FINAL INTEGRATION, POLISH & DEMO PREPARATION

### Objective
Connect everything end-to-end. Eliminate all remaining bugs. Optimize performance. Prepare demo cache and script. Make the project hackathon-ready.

### Planning Step
Before code: do a complete end-to-end walkthrough of the demo script (below). Note every point where something could fail. Fix those proactively.

### Tasks — Integration Testing

1. Full end-to-end test for each of the 5 villages:
   - Select village → map flies, boundary appears
   - Metrics load with GEEProgress feedback
   - Score calculates → ring animates
   - AI summary generates
   - Timeline slider → all data updates
   - AI chat → 3 questions answered correctly
   - Recommendations → 3 cards with correct priority
   - PDF download → file saves correctly

2. Fix every integration bug found.

### Performance

3. Frontend:
   - `React.memo` on: all chart components, MapContainer, MetricsPanel
   - `useMemo` for: score calculations, land cover aggregations
   - `React.lazy` + `Suspense` for: dashboard tabs (code splitting)
   - Verify bundle size: `npm run build` and inspect dist

4. Backend:
   - Profile GEE call times (check logs from Level 3)
   - Ensure all I/O is async (no blocking calls in FastAPI routes)
   - Verify cache hit rate is > 80% for demo villages after warm-up

### Code Cleanup (Zero Tolerance)

5. Run each of these and fix everything found:
   ```bash
   npm run tsc -- --noEmit          # zero TypeScript errors
   npm run lint                      # zero ESLint warnings
   npm run build                     # successful build, zero warnings
   python -m mypy backend/app/       # zero type errors
   python -m pytest backend/tests/   # all tests pass
   grep -r "console\." frontend/src/ # zero results
   grep -r "Math\.random" frontend/src/ backend/app/  # zero results
   grep -r "# TODO\|# FIXME\|# VERIFY" backend/app/  # zero results
   grep -r "any>" frontend/src/      # zero TypeScript any
   ```

### Security Review

6. Verify no API keys in frontend source (only `VITE_` env vars)
7. Verify `.gitignore` covers: `venv/`, `.env`, `node_modules/`, `credentials/`, `*.pyc`, `dist/`, `__pycache__/`
8. Verify CORS `allow_origins` is restrictive (not `*`)
9. Verify all backend inputs validated with Pydantic (no raw dict usage in routes)
10. Verify rate limiting on AI endpoints (10 req/min/IP)

### Demo Cache

11. Create `scripts/demo_setup.py`:
    ```python
    """
    Pre-warms the GEE cache for all 5 demo villages and all 5 years.
    Run this before the hackathon demo to ensure < 2s load times.
    """
    import asyncio
    import httpx

    VILLAGES = ["mulshi", "maval", "ambegaon", "khed", "junnar"]
    YEARS = [2022, 2023, 2024, 2025, 2026]

    async def warm_cache():
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            for village in VILLAGES:
                for year in YEARS:
                    print(f"Warming {village} {year}...")
                    await client.get(f"/api/v1/satellite/{village}/metrics?year={year}")
                    await client.get(f"/api/v1/scores/{village}?year={year}")
                    await client.post(f"/api/v1/ai/{village}/summary?year={year}")
                    await client.post(f"/api/v1/ai/{village}/recommendations?year={year}")
                    print(f"  ✓ {village} {year} cached")

    asyncio.run(warm_cache())
    ```

### Documentation

12. Complete `README.md`:
    ```markdown
    # GramDrishti (ग्रामदृष्टि)
    ## AI-Powered Climate Intelligence Platform for Indian Villages

    ### Problem
    ### Solution
    ### Quick Start
    ### Architecture
    ### Tech Stack
    ### Environment Variables (complete table)
    ### Demo Villages (names, coordinates)
    ### Data Sources
    ### API Reference (link to /docs)
    ### Running the Demo Cache Warm-Up
    ### Team
    ```

13. Create `docs/ARCHITECTURE.md`:
    ```
    System Architecture Diagram (ASCII):

    [Leaflet Map] ←→ [React Frontend] ←→ [FastAPI Backend]
                                               ↓
                                    ┌──────────────────────┐
                                    │  Google Earth Engine │
                                    │  Open-Meteo Weather  │
                                    │  Gemini AI / Ollama  │
                                    └──────────────────────┘

    Data Flow:
    Village Selection → GEE Processing → Environmental Metrics
    → Health Score → AI Analysis → Dashboard + PDF Report
    ```

### DEMO SCRIPT

```
═══════════════════════════════════════
GRAMDRISHTI DEMO — 5 MINUTES
═══════════════════════════════════════

SCENE 1 — PROBLEM (30 sec)
"640,000 Indian villages face climate stress.
 Gram Panchayats have no tools to measure it.
 GramDrishti changes that."
→ Show India map with 5 village markers

SCENE 2 — VILLAGE SELECTION (30 sec)
→ Click Mulshi marker
→ Map flies to Mulshi, boundary appears in mint
→ GEEProgress shows (if not cached) or instant load (if cached)
"Real Sentinel-2 satellite data. Updated from orbit."

SCENE 3 — HEALTH SCORE (45 sec)
→ Overview tab: score ring animates to 68
"Overall health: 68/100. But look at water: 54/100 and declining."
→ Point to water component bar
→ Switch to map, toggle Water Layer
"See the water bodies? Down 22% since 2022."

SCENE 4 — HISTORICAL TIMELINE (30 sec)
→ History tab
→ Drag slider: 2022 → 2023 → 2024 → 2025 → 2026
"NDVI dropped from 0.61 to 0.48. Vegetation stress over 4 years."
→ Point to NDVI trend chart

SCENE 5 — AI ANALYST (45 sec)
→ AI tab
→ Village summary already loaded
→ Type: "Why is water availability decreasing?"
→ AI responds with specific, contextual answer
"The AI references real metrics — not a generic answer."

SCENE 6 — RECOMMENDATIONS (30 sec)
→ Show RecommendationsPanel
"Priority 1: Restore the pond via MGNREGA.
 Priority 2: Watershed recharge. Priority 3: Drip irrigation via PMKSY."
"These aren't guesses — they're grounded in satellite data."

SCENE 7 — CONTRAST (30 sec)
→ Switch to Maval village
→ Score: 79/100, improving trend
"Maval is recovering. Green cover up 6.8%. Different story, same tool."

SCENE 8 — EXPORT (15 sec)
→ Report tab → Click "Download PDF Report"
→ PDF downloads
"The Gram Panchayat can take this to the district office today."

SCENE 9 — IMPACT (15 sec)
"640,000 villages. Real satellite data. Local AI. Zero cost to the village."
```

### FINAL AUDIT CHECKLIST
```
□ npm run build — SUCCESS, zero errors, zero warnings
□ npm run lint — zero warnings
□ npm run tsc -- --noEmit — zero errors
□ python -m mypy backend/app/ — zero errors
□ python -m pytest backend/tests/ — all pass
□ grep console\. frontend/src/ — zero results
□ grep Math\.random — zero results
□ grep TODO\|FIXME\|VERIFY — zero results in non-test source
□ No TypeScript 'any' anywhere
□ No ESLint suppressions without documented reason
□ All 5 villages load end-to-end (map → metrics → score → AI → PDF)
□ GEE data is real satellite data (not mock) in final build
□ GEEProgress shows correctly for live calls
□ Cache warm-up script runs successfully
□ All cached data loads in < 2 seconds
□ Demo script tested end-to-end in < 5 minutes
□ Responsive: correct at 375px, 768px, 1024px, 1440px
□ All charts render and resize
□ AI chat functional for all question types
□ PDF download works
□ JSON and CSV downloads work
□ Health scores mathematically correct (verify by hand for 1 village)
□ Historical trends show correct year-over-year changes
□ Rate limiting on AI endpoints verified
□ CORS correct (not wildcard)
□ .gitignore complete and verified (no secrets committed)
□ credentials/ not in git history
□ README complete and accurate
□ API docs complete (/docs accessible)
□ Architecture docs complete
□ demo_setup.py runs without error
□ Semantic commit history (no "fix stuff" commits)
□ Project builds from fresh clone using README instructions
□ Final commit tagged: git tag v1.0.0-hackathon
```

---

# MOCK DATA (Development Use Only)

Use these values when `USE_MOCK_DATA=true`. These are deterministic — never use random generation.
Replace with live GEE data as soon as authentication is configured.

```python
MOCK_METRICS: dict[str, dict[int, dict]] = {
    "mulshi": {
        2022: {"ndvi": 0.61, "ndwi": 0.23, "water_area_ha": 156.2, "green_cover_percent": 52.1,
               "land_cover": {"trees": 28.1, "cropland": 24.0, "water": 4.2, "built": 3.1,
                              "grassland": 16.4, "bareLand": 5.8, "flooded": 0.4}},
        2023: {"ndvi": 0.57, "ndwi": 0.19, "water_area_ha": 143.8, "green_cover_percent": 49.3,
               "land_cover": {"trees": 26.4, "cropland": 22.9, "water": 3.8, "built": 3.4,
                              "grassland": 15.2, "bareLand": 7.1, "flooded": 0.3}},
        2024: {"ndvi": 0.52, "ndwi": 0.16, "water_area_ha": 131.4, "green_cover_percent": 46.8,
               "land_cover": {"trees": 24.8, "cropland": 22.0, "water": 3.5, "built": 3.7,
                              "grassland": 14.3, "bareLand": 8.6, "flooded": 0.3}},
        2025: {"ndvi": 0.49, "ndwi": 0.14, "water_area_ha": 124.1, "green_cover_percent": 44.2,
               "land_cover": {"trees": 23.1, "cropland": 21.1, "water": 3.3, "built": 4.0,
                              "grassland": 13.6, "bareLand": 9.8, "flooded": 0.2}},
        2026: {"ndvi": 0.48, "ndwi": 0.13, "water_area_ha": 118.7, "green_cover_percent": 43.1,
               "land_cover": {"trees": 22.4, "cropland": 20.7, "water": 3.2, "built": 4.2,
                              "grassland": 13.1, "bareLand": 10.4, "flooded": 0.2}},
    },
    "maval": {
        2022: {"ndvi": 0.55, "ndwi": 0.18, "water_area_ha": 89.3, "green_cover_percent": 44.2,
               "land_cover": {"trees": 22.1, "cropland": 22.1, "water": 2.4, "built": 4.2,
                              "grassland": 14.8, "bareLand": 6.2, "flooded": 0.2}},
        2023: {"ndvi": 0.56, "ndwi": 0.20, "water_area_ha": 92.1, "green_cover_percent": 45.8,
               "land_cover": {"trees": 23.0, "cropland": 22.8, "water": 2.5, "built": 4.1,
                              "grassland": 15.1, "bareLand": 5.9, "flooded": 0.2}},
        2024: {"ndvi": 0.58, "ndwi": 0.22, "water_area_ha": 95.6, "green_cover_percent": 47.3,
               "land_cover": {"trees": 24.1, "cropland": 23.2, "water": 2.6, "built": 4.0,
                              "grassland": 15.6, "bareLand": 5.5, "flooded": 0.2}},
        2025: {"ndvi": 0.60, "ndwi": 0.24, "water_area_ha": 98.2, "green_cover_percent": 49.1,
               "land_cover": {"trees": 25.2, "cropland": 23.9, "water": 2.7, "built": 3.9,
                              "grassland": 16.0, "bareLand": 5.1, "flooded": 0.2}},
        2026: {"ndvi": 0.62, "ndwi": 0.26, "water_area_ha": 102.4, "green_cover_percent": 51.0,
               "land_cover": {"trees": 26.4, "cropland": 24.6, "water": 2.8, "built": 3.8,
                              "grassland": 16.5, "bareLand": 4.8, "flooded": 0.1}},
    },
    "ambegaon": {
        2022: {"ndvi": 0.58, "ndwi": 0.20, "water_area_ha": 112.3, "green_cover_percent": 48.6,
               "land_cover": {"trees": 25.2, "cropland": 23.4, "water": 3.0, "built": 3.5,
                              "grassland": 15.4, "bareLand": 6.4, "flooded": 0.3}},
        2023: {"ndvi": 0.57, "ndwi": 0.19, "water_area_ha": 109.8, "green_cover_percent": 47.9,
               "land_cover": {"trees": 24.8, "cropland": 23.1, "water": 2.9, "built": 3.6,
                              "grassland": 15.2, "bareLand": 6.8, "flooded": 0.3}},
        2024: {"ndvi": 0.56, "ndwi": 0.18, "water_area_ha": 107.1, "green_cover_percent": 47.1,
               "land_cover": {"trees": 24.3, "cropland": 22.8, "water": 2.8, "built": 3.7,
                              "grassland": 14.9, "bareLand": 7.2, "flooded": 0.3}},
        2025: {"ndvi": 0.55, "ndwi": 0.17, "water_area_ha": 104.6, "green_cover_percent": 46.3,
               "land_cover": {"trees": 23.8, "cropland": 22.5, "water": 2.8, "built": 3.8,
                              "grassland": 14.7, "bareLand": 7.7, "flooded": 0.2}},
        2026: {"ndvi": 0.54, "ndwi": 0.16, "water_area_ha": 102.0, "green_cover_percent": 45.5,
               "land_cover": {"trees": 23.2, "cropland": 22.3, "water": 2.7, "built": 3.9,
                              "grassland": 14.4, "bareLand": 8.1, "flooded": 0.2}},
    },
    "khed": {
        2022: {"ndvi": 0.52, "ndwi": 0.15, "water_area_ha": 78.4, "green_cover_percent": 43.2,
               "land_cover": {"trees": 21.4, "cropland": 21.8, "water": 2.1, "built": 4.8,
                              "grassland": 14.2, "bareLand": 8.4, "flooded": 0.1}},
        2023: {"ndvi": 0.50, "ndwi": 0.13, "water_area_ha": 74.2, "green_cover_percent": 41.8,
               "land_cover": {"trees": 20.6, "cropland": 21.2, "water": 2.0, "built": 5.0,
                              "grassland": 13.8, "bareLand": 9.2, "flooded": 0.1}},
        2024: {"ndvi": 0.48, "ndwi": 0.11, "water_area_ha": 70.1, "green_cover_percent": 40.4,
               "land_cover": {"trees": 19.8, "cropland": 20.6, "water": 1.9, "built": 5.2,
                              "grassland": 13.4, "bareLand": 10.0, "flooded": 0.1}},
        2025: {"ndvi": 0.47, "ndwi": 0.10, "water_area_ha": 67.5, "green_cover_percent": 39.6,
               "land_cover": {"trees": 19.2, "cropland": 20.4, "water": 1.8, "built": 5.4,
                              "grassland": 13.0, "bareLand": 10.7, "flooded": 0.1}},
        2026: {"ndvi": 0.45, "ndwi": 0.09, "water_area_ha": 64.8, "green_cover_percent": 38.7,
               "land_cover": {"trees": 18.6, "cropland": 20.1, "water": 1.7, "built": 5.6,
                              "grassland": 12.7, "bareLand": 11.4, "flooded": 0.1}},
    },
    "junnar": {
        2022: {"ndvi": 0.59, "ndwi": 0.21, "water_area_ha": 134.7, "green_cover_percent": 50.2,
               "land_cover": {"trees": 26.8, "cropland": 23.4, "water": 3.6, "built": 3.2,
                              "grassland": 15.6, "bareLand": 5.8, "flooded": 0.4}},
        2023: {"ndvi": 0.60, "ndwi": 0.22, "water_area_ha": 137.2, "green_cover_percent": 51.0,
               "land_cover": {"trees": 27.2, "cropland": 23.8, "water": 3.7, "built": 3.1,
                              "grassland": 15.8, "bareLand": 5.6, "flooded": 0.4}},
        2024: {"ndvi": 0.61, "ndwi": 0.23, "water_area_ha": 139.8, "green_cover_percent": 51.8,
               "land_cover": {"trees": 27.6, "cropland": 24.2, "water": 3.8, "built": 3.0,
                              "grassland": 16.0, "bareLand": 5.3, "flooded": 0.4}},
        2025: {"ndvi": 0.62, "ndwi": 0.24, "water_area_ha": 142.1, "green_cover_percent": 52.6,
               "land_cover": {"trees": 28.0, "cropland": 24.6, "water": 3.8, "built": 2.9,
                              "grassland": 16.2, "bareLand": 5.0, "flooded": 0.4}},
        2026: {"ndvi": 0.63, "ndwi": 0.25, "water_area_ha": 144.5, "green_cover_percent": 53.4,
               "land_cover": {"trees": 28.4, "cropland": 25.0, "water": 3.9, "built": 2.8,
                              "grassland": 16.4, "bareLand": 4.7, "flooded": 0.4}},
    },
}
```

Demo narrative summary:
- **Mulshi**: Declining across all metrics (good drama for demo)
- **Maval**: Steadily improving (positive contrast)
- **Ambegaon**: Slow decline (moderate concern)
- **Khed**: Faster decline, drier (urgent concern)
- **Junnar**: Improving (second success story)

---

# FINAL DECLARATION

This document is the complete specification for GramDrishti v2.0.

Begin at Level 1.
Plan before you code at every level.
Audit after every level.
Produce the Level Report before proceeding.
Fix before you move on.
Never cut corners.

GramDrishti represents a real solution to a real problem affecting 640,000 Indian villages.
Build it with that in mind.
