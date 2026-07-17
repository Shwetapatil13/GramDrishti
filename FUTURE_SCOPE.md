# Future Scope — GramDrishti

A roadmap of planned improvements, expansion opportunities, and long-term vision for the platform.

---

## Table of Contents

- [Upcoming Features](#upcoming-features)
- [AI Improvements](#ai-improvements)
- [GIS & Data Improvements](#gis--data-improvements)
- [Enterprise Features](#enterprise-features)
- [Mobile Application](#mobile-application)
- [Internationalization](#internationalization)
- [Security Improvements](#security-improvements)
- [Performance Optimizations](#performance-optimizations)
- [Business Opportunities](#business-opportunities)
- [Research Opportunities](#research-opportunities)

---

## Upcoming Features

### Phase 2: Post-Hackathon Foundation (1–3 months)

| Feature | Description | Priority |
|---|---|---|
| **PostgreSQL + PostGIS** | Persistent storage for village data, user accounts, and spatial queries | High |
| **Redis Caching** | Shared cache across Uvicorn workers; survives restarts | High |
| **User Accounts & RBAC** | Role-based access: Admin, District Official, Village Official, Viewer | High |
| **Notification System** | Alerts when environmental metrics cross configurable thresholds | Medium |
| **Scheduled Data Refresh** | Cron jobs to pull new Sentinel-2 imagery on satellite pass schedules | Medium |
| **Comparative View** | Side-by-side comparison of two villages on metrics, scores, and trends | Medium |

### Phase 3: Expansion (3–6 months)

| Feature | Description | Priority |
|---|---|---|
| **District-Level Dashboard** | Aggregate view across all villages in a district with ranking tables | High |
| **Soil Type Layer** | Integrate soil classification rasters for agricultural recommendations | Medium |
| **Flood Risk Maps** | Pre-computed flood inundation layers based on DEM + rainfall models | Medium |
| **Third-Party API Access** | API keys and rate limiting for external developers and researchers | Medium |
| **Webhook Integrations** | Push village health alerts to Slack, email, or government MIS systems | Low |
| **Custom Report Templates** | Allow officials to configure which sections appear in generated reports | Low |

---

## AI Improvements

### Short-Term (1–3 months)

| Improvement | Description | Impact |
|---|---|---|
| **Conversation Memory** | Persist chat history per village per user across sessions | Better follow-up conversations |
| **Multi-Village Comparison AI** | "Compare water availability between Mulshi and Maval" | Cross-village intelligence |
| **Image Analysis** | Upload field photos; AI analyzes crop health visually | Ground-truth validation |
| **Citation Links** | AI responses include clickable links to the exact data source | Improved trust |

### Medium-Term (3–6 months)

| Improvement | Description | Impact |
|---|---|---|
| **Predictive Models** | Random Forest or XGBoost on historical NDVI + weather to predict crop yield | Proactive decision making |
| **Anomaly Detection** | Flag sudden changes in NDVI, NDWI, or land cover as alerts | Early warning system |
| **Multi-Agent Routing** | Separate agents for agriculture, water, disaster, and governance with specialized prompts | Higher quality responses per domain |
| **Evaluation Framework** | Automated accuracy testing of AI responses against ground-truth datasets | Quality assurance |

### Long-Term (6+ months)

| Improvement | Description | Impact |
|---|---|---|
| **Fine-Tuned Model** | Train a specialized model on Indian agricultural and environmental terminology | Better accuracy for domain-specific queries |
| **Voice Interface** | Speech-to-text input and text-to-speech output for field workers with limited literacy | Accessibility |
| **Offline AI** | Package a quantized Ollama model for offline deployment on local servers | Works in areas without internet |

---

## GIS & Data Improvements

| Improvement | Description | Data Source |
|---|---|---|
| **Sentinel-1 SAR** | Radar imagery for cloud-free monitoring during monsoon | `COPERNICUS/S1_GRD` |
| **MODIS Fire** | Detect active fires and burned areas near villages | `MODIS/061/MOD14A1` |
| **Groundwater Data** | Integrate Central Ground Water Board (CGWB) well-level data | CGWB API |
| **Soil Moisture** | SMAP or SMOS soil moisture for drought monitoring | `NASA/SMAP/SPL3SMP` |
| **Nighttime Lights** | VIIRS nighttime lights as a proxy for electrification and economic activity | `NOAA/VIIRS/DNB` |
| **Population Estimates** | WorldPop or GPW population grids for per-capita metrics | WorldPop |
| **Road Network** | OSM road network analysis for accessibility scoring | OpenStreetMap |
| **Higher Temporal Resolution** | Monthly or weekly NDVI composites instead of annual | Sentinel-2 with cloud masking |

---

## Enterprise Features

| Feature | Description | Target User |
|---|---|---|
| **Multi-Tenancy** | Isolated environments per state government or organization | State IT departments |
| **SSO Integration** | OAuth2 / SAML with government identity providers (DigiLocker, eSign) | Government officials |
| **Audit Dashboard** | Visual dashboard of all AI queries, confidence scores, and response times | Compliance officers |
| **Data Export API** | Bulk export of village metrics across time ranges in CSV/GeoJSON | Researchers |
| **SLA Monitoring** | Uptime, latency, and error rate tracking | IT operations |
| **White-Labeling** | Custom branding for deployment by state governments or NGOs | Institutional partners |

---

## Mobile Application

### React Native Port

The current React + Leaflet frontend can be partially ported to React Native with `react-native-maps`:

| Feature | Mobile Approach |
|---|---|
| Map rendering | `react-native-maps` with GeoJSON overlays |
| AI Chat | Same SSE streaming logic via React Native Fetch API |
| Dashboard | Collapsible bottom sheet (similar to current mobile UX) |
| Reports | In-app PDF viewer + share sheet |
| Offline Mode | SQLite cache for village data + bundled Ollama model |

### Progressive Web App (PWA)

A faster path than React Native:
- Add service worker for offline caching
- Enable "Add to Home Screen" on Android
- Cache village data and map tiles for offline access

---

## Internationalization

### Current: 3 Languages
- English (EN), Hindi (HI), Marathi (MR)
- Full UI translation via i18next
- AI responds in the selected language

### Planned Expansion

| Language | Region | Priority |
|---|---|---|
| Kannada | Karnataka | Medium |
| Telugu | Telangana, Andhra Pradesh | Medium |
| Tamil | Tamil Nadu | Medium |
| Bengali | West Bengal | Medium |
| Gujarati | Gujarat | Low |
| Odia | Odisha | Low |

### Implementation
- Add translation JSON files under `frontend/src/locales/{lang}/common.json`
- The AI already supports multi-language via the `language` parameter in the prompt builder — Gemini handles translation natively

---

## Security Improvements

| Improvement | Description | Priority |
|---|---|---|
| **Server-Side Auth** | JWT tokens with refresh flow; bcrypt password hashing | Critical |
| **API Key Management** | Per-user API keys for programmatic access with rate limits | High |
| **Input Sanitization** | Validate and sanitize all user inputs (village names, AI questions) | High |
| **HTTPS Enforcement** | TLS termination at load balancer level | High |
| **Content Security Policy** | CSP headers to prevent XSS on the frontend | Medium |
| **Dependency Auditing** | Automated `pip audit` and `npm audit` in CI/CD | Medium |
| **GEE Credential Rotation** | Automated service account key rotation | Medium |
| **Rate Limiting per User** | Per-authenticated-user rate limits (not just per-IP) | Medium |

---

## Performance Optimizations

| Optimization | Current State | Improvement | Expected Impact |
|---|---|---|---|
| **Caching** | In-memory TTLCache | Redis with configurable TTL per dataset | Shared across workers; survives deploys |
| **GEE Batch Processing** | One village at a time | Batch compute for all villages in a district | 10x faster regional analysis |
| **Frontend Bundle** | Lazy tabs, Vite code splitting | Tree-shake unused ECharts modules | 30% smaller bundle |
| **Map Tiles** | GEE tile URLs fetched per request | Pre-generate and cache tile URLs with 1h TTL | Eliminate GEE call for tile display |
| **AI Response** | Sequential: classify → retrieve → process → generate | Parallel retrieve + classify; stream processor output | 2-3s faster response time |
| **Search Index** | Linear scan of in-memory list | Full-text search with PostgreSQL `tsvector` or Elasticsearch | Sub-10ms for 640K villages |
| **Image Optimization** | PNG assets served directly | WebP conversion + CDN delivery | Faster landing page load |

---

## Business Opportunities

### Government Partnerships
- **Ministry of Panchayati Raj**: Direct integration with the e-Panchayat MIS for scheme monitoring
- **State Rural Development Departments**: White-labeled deployment per state
- **NITI Aayog Aspirational Districts**: Target the 112 aspirational districts for climate resilience monitoring

### NGO & Research Sector
- **UNDP / World Bank**: Environmental monitoring tool for development projects
- **Agricultural universities**: Research platform for crop stress analysis
- **CSR Funding**: Corporate social responsibility projects for water conservation monitoring

### SaaS Model
- **Free Tier**: 5 villages, mock data, limited AI queries
- **Pro Tier**: Unlimited villages, live satellite data, PDF reports, API access
- **Enterprise Tier**: Multi-tenancy, SSO, custom domains, SLA guarantees

### Data Products
- **Village Health Index**: Periodic ranking of all Indian villages by environmental health
- **API Marketplace**: Sell pre-computed village metrics to agri-tech companies and insurance firms
- **Climate Risk Scores**: Provide risk scores to micro-insurance providers for crop insurance pricing

---

## Research Opportunities

| Research Area | Dataset | Question |
|---|---|---|
| **Land Use Change** | 5 years of Dynamic World + NDVI | How is urbanization affecting green cover in peri-urban villages? |
| **Climate Adaptation** | Health scores + weather trends | Which villages are successfully adapting to climate change, and why? |
| **Scheme Effectiveness** | Scheme matching + score trends | Do villages receiving PMKSY funds show improved water security scores? |
| **AI Explainability** | Audit logs + user surveys | Does source attribution and confidence scoring improve user trust in AI recommendations? |
| **Spatial Autocorrelation** | Choropleth data across districts | Are environmental health patterns spatially clustered, and what drives the clusters? |

---

*For current architecture, see [ARCHITECTURE.md](ARCHITECTURE.md). For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).*
