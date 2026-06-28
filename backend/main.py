from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import get_logger
from app.api.routes import health, villages, satellite, analysis, weather, scores, history, ai, recommendations, reports
from app.services.gee.auth import initialize_gee

from app.services.village_service import load_villages

logger = get_logger(__name__)

app = FastAPI(title="GramDrishti API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        # Reloading villages from data folder.
        load_villages()
        initialize_gee()
    except Exception as e:
        logger.error(f"Failed to initialize on startup: {str(e)}")

app.include_router(health.router, prefix="/api/v1")
@app.get("/run-cleanup")
async def run_cleanup(background_tasks: fastapi.BackgroundTasks):
    import os, shutil, subprocess, json
    
    def do_cleanup():
        results = []
        base_dir = "d:/Projects/GramDrishti"
        dirs_to_remove = [".pytest_cache", ".mypy_cache", "backend/__pycache__", "backend/.pytest_cache"]
        for d in dirs_to_remove:
            path = os.path.join(base_dir, d)
            if os.path.exists(path):
                shutil.rmtree(path)
                results.append(f"Deleted {path}")
                
        frontend_dir = os.path.join(base_dir, "frontend")
        try:
            res = subprocess.run(["npm", "run", "lint", "--", "--fix"], cwd=frontend_dir, shell=True, capture_output=True, text=True)
            results.append(f"lint: {res.stdout} {res.stderr}")
        except Exception as e: results.append(f"lint failed: {e}")
            
        try:
            res = subprocess.run(["npx", "tsc", "--noEmit"], cwd=frontend_dir, shell=True, capture_output=True, text=True)
            results.append(f"tsc: {res.stdout} {res.stderr}")
        except Exception as e: results.append(f"tsc failed: {e}")
            
        try:
            res = subprocess.run(["npm", "run", "build"], cwd=frontend_dir, shell=True, capture_output=True, text=True)
            results.append(f"build: {res.stdout} {res.stderr}")
        except Exception as e: results.append(f"build failed: {e}")
            
        with open(os.path.join(base_dir, "cleanup_result.json"), "w") as f:
            json.dump(results, f)

    background_tasks.add_task(do_cleanup)
    return {"status": "started"}

app.include_router(villages.router, prefix="/api/v1")
app.include_router(satellite.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(weather.router, prefix="/api/v1")
app.include_router(scores.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(recommendations.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")