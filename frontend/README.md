# GramDrishti Frontend

React 18 + TypeScript + Vite client for GramDrishti: a Leaflet map with Google Earth Engine
overlays, the village dashboard, and the AI chat panel.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL points at the FastAPI backend (default http://localhost:8000)
npm run dev            # http://localhost:5173
```

## Scripts

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Layout

```text
src/
├── components/
│   ├── ai/          # Chat panel, message cards, dynamic charts
│   ├── auth/        # Login page layout
│   ├── charts/      # ECharts wrappers (land cover, NDVI, trends)
│   ├── dashboard/   # Right-hand dashboard tabs
│   ├── landing/     # Marketing landing page
│   ├── layout/      # App shell: header, sidebar, language switcher
│   ├── map/         # MapContainer, satellite overlays, inspector, legend, search
│   │   └── services/  # Non-visual map helpers (bounds lock, farm boundaries)
│   ├── ui/          # Shared UI primitives
│   └── workspace/   # Expanded village intelligence workspace
├── hooks/           # Data hooks (React Query) and app-wide context providers
├── i18n/, locales/  # i18next setup and en / hi / mr translations
├── pages/, routes/  # Route pages and the auth guard
├── services/        # Axios API client and report downloads
├── styles/          # Global CSS / Tailwind layers
├── types/           # Shared TypeScript types
└── utils/           # Geo helpers
```

See the [root README](../README.md) and [docs/](../docs) for architecture and backend setup.
