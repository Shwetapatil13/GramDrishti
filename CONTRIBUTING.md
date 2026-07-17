# Contributing to GramDrishti

Thank you for your interest in contributing. This guide covers everything you need to get started.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Branch Naming](#branch-naming)
- [Commit Convention](#commit-convention)
- [Pull Request Checklist](#pull-request-checklist)
- [Coding Standards](#coding-standards)
- [Adding a New Feature](#adding-a-new-feature)
- [Reporting Issues](#reporting-issues)
- [Code of Conduct](#code-of-conduct)

---

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GramDrishti.git
   cd GramDrishti
   ```
3. Set up the development environment (see [Development Environment](#development-environment)).
4. Create a branch for your work (see [Branch Naming](#branch-naming)).
5. Make your changes following the [Coding Standards](#coding-standards).
6. Submit a Pull Request using the [PR Checklist](#pull-request-checklist).

---

## Development Environment

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set USE_MOCK_DATA=true for development without API keys
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Linting

**Frontend:**
```bash
cd frontend
npm run lint
npx prettier --check src/
```

---

## Branch Naming

Use the following format: `<type>/<short-description>`

| Type | Use Case | Example |
|---|---|---|
| `feat` | New feature | `feat/soil-type-layer` |
| `fix` | Bug fix | `fix/choropleth-zoom-issue` |
| `refactor` | Code restructuring | `refactor/ai-service-cleanup` |
| `docs` | Documentation changes | `docs/update-architecture` |
| `test` | Adding or updating tests | `test/scoring-engine-unit` |
| `chore` | Build, deps, CI changes | `chore/upgrade-vite-8` |
| `perf` | Performance improvement | `perf/cache-layer-optimization` |

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Examples

```
feat(ai): add schemes processor for government scheme matching
fix(map): prevent crash when village has no boundary polygon
docs(readme): update quick start with mock data instructions
refactor(scoring): extract water score into standalone function
test(api): add integration test for satellite metrics endpoint
chore(deps): update fastapi to 0.104
perf(gee): parallelize sentinel2 and dynamic_world fetches
```

### Scope Reference

| Scope | Refers To |
|---|---|
| `ai` | AI pipeline (service, processors, classifier, prompt builder) |
| `map` | Leaflet map components and layers |
| `dashboard` | Dashboard panel, tabs, and widgets |
| `scoring` | Health scoring engine |
| `gee` | Google Earth Engine integration |
| `weather` | Open-Meteo weather services |
| `reports` | PDF/JSON/CSV report generation |
| `api` | FastAPI routes and request handling |
| `auth` | Authentication |
| `i18n` | Internationalization and translations |
| `deps` | Dependency updates |
| `config` | Configuration and environment variables |

---

## Pull Request Checklist

Before submitting a PR, ensure:

### Code Quality
- [ ] Code follows the coding standards for the relevant language
- [ ] No commented-out code or `console.log` statements left in
- [ ] No hardcoded API keys, URLs, or credentials
- [ ] All existing tests pass
- [ ] New features include basic tests where test infrastructure exists

### Documentation
- [ ] Code changes are reflected in relevant documentation
- [ ] New environment variables are documented in `.env.example` and README
- [ ] Complex logic includes inline comments explaining why, not what

### Frontend Specific
- [ ] No TypeScript errors (`npm run tsc`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Components are responsive (tested on desktop and mobile viewport)
- [ ] New UI text uses i18n translation keys, not hardcoded strings
- [ ] Framer Motion animations do not cause layout shifts

### Backend Specific
- [ ] Pydantic models validate inputs correctly
- [ ] API responses follow existing patterns (same shape, HTTP codes)
- [ ] New routes are registered in `main.py`
- [ ] Errors return appropriate HTTP status codes with descriptive messages
- [ ] Cache keys do not conflict with existing keys

### PR Description
- [ ] Title follows commit convention: `feat(scope): description`
- [ ] Description explains what changed and why
- [ ] Links to related issues if applicable
- [ ] Screenshots included for UI changes
- [ ] Breaking changes are clearly noted

---

## Coding Standards

### Python (Backend)

| Rule | Convention |
|---|---|
| Style | PEP 8 |
| Type hints | Required for all function signatures |
| Async | Use `async/await` for all I/O operations |
| Models | Pydantic `BaseModel` for all request/response schemas |
| Logging | Use `get_logger(__name__)` from `app.core.logging` |
| Config | Access settings via `app.core.config.settings` |
| Errors | Raise `HTTPException` with appropriate status codes |
| Imports | Standard library, then third party, then local — separated by blank lines |

Example:
```python
from typing import List, Optional           # stdlib
from fastapi import APIRouter, HTTPException # third-party
from app.core.logging import get_logger      # local

logger = get_logger(__name__)

async def get_metrics(village_id: str, year: int = 2024) -> dict:
    """Fetch environmental metrics for a village."""
    # implementation
```

### TypeScript (Frontend)

| Rule | Convention |
|---|---|
| Style | Prettier (config in `.prettierrc`) |
| Components | Functional components with `React.FC` typing |
| Hooks | Custom hooks prefixed with `use` |
| State | Zustand for global state; React Context for shared component state |
| API calls | Use `apiService` from `services/api.ts` |
| Types | Define in `types/index.ts`; avoid `any` |
| Styling | Tailwind CSS utility classes following existing design tokens |
| i18n | Use `useTranslation()` hook; keys in `locales/{lang}/common.json` |

Example:
```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVillageSelection } from '@/hooks/useVillageSelection';

export const MyComponent: React.FC = () => {
  const { t } = useTranslation();
  const { selectedVillage } = useVillageSelection();

  return (
    <div className="p-4 bg-surface-slate rounded-lg">
      <h2 className="text-display text-text-primary">
        {t('my_component.title', 'Default Title')}
      </h2>
    </div>
  );
};
```

---

## Adding a New Feature

### Adding a New AI Processor

1. Create `backend/app/services/ai/processors/your_domain.py`:
   ```python
   def process(context_blocks: dict) -> dict:
       metrics = context_blocks.get("metrics", {}).get("value", {})

       metrics_array = [{"name": "...", "value": ..., "unit": "...", "trend": "...", "status": "...", "source": "..."}]
       charts_array = [{"type": "line", "title": "...", "x": [...], "y": [...]}]
       actions_array = [{"type": "toggle_layer", "layer": "your_layer"}]

       return {
           "domain": "YourDomain",
           "metrics": metrics_array,
           "charts": charts_array,
           "actions": actions_array,
           "recommendations": []
       }
   ```

2. Add the intent to `classifier.py`'s `INTENTS` list.

3. Wire it into `ai_service.py`:
   ```python
   from app.services.ai.processors import your_domain

   if "your_intent" in intents:
       processor_outputs["your_domain"] = your_domain.process(context_blocks)
       audit.log_processor("YourDomainProcessor")
   ```

### Adding a New GIS Layer

1. Create tile generation in `backend/app/services/gee/your_layer.py`
2. Add a route in `satellite.py` for `GET /{village_id}/your_layer/tiles`
3. Create `components/map/YourLayer.tsx` with a `TileLayer` component
4. Add the layer key to `useVillageSelection.tsx`'s `activeLayers` state
5. Add a toggle in `LayerControl.tsx`
6. Add `{"type": "toggle_layer", "layer": "your_layer"}` as a supported action in the AI

### Adding a New Language

1. Create `frontend/src/locales/{lang}/common.json` with translated keys
2. Add the language to `frontend/src/i18n/config.ts`
3. Add the language option to `LanguageSwitcher.tsx`
4. Add the language instruction to `backend/app/services/ai/prompt_builder.py`

---

## Reporting Issues

When opening an issue, include:

1. **Description:** What happened vs. what you expected
2. **Steps to Reproduce:** Minimal steps to trigger the issue
3. **Environment:** OS, Python version, Node version, browser
4. **Logs:** Relevant error messages from browser console or backend logs
5. **Screenshots:** For UI issues

Labels:
- `bug` — Something broken
- `enhancement` — Feature request
- `documentation` — Docs improvement
- `good first issue` — Suitable for new contributors
- `help wanted` — Looking for contributors

---

## Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be respectful, focus on constructive feedback, and assume good intentions.

---

*For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md). For the demo guide, see [DEMO_GUIDE.md](DEMO_GUIDE.md).*
