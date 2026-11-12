import os
import sys
from pathlib import Path

# Add project root to sys.path and PYTHONPATH so backend imports work from any directory
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
os.environ["PYTHONPATH"] = str(root_dir) + (os.pathsep + os.environ["PYTHONPATH"] if "PYTHONPATH" in os.environ else "")

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from backend.config import CHART_DIR, REPORT_DIR, UPLOAD_DIR, HOST, PORT
from backend.database.connection import engine, Base
from backend.routes import dataset_routes, analysis_routes, report_routes, chat_routes, settings_routes, agent_routes
from backend.services.sample_dataset_service import generate_sample_datasets

# Create Database Tables automatically
Base.metadata.create_all(bind=engine)

# Auto-generate sample datasets on startup
try:
    generate_sample_datasets()
except Exception as e:
    print(f"Sample datasets generation warning: {e}")

# Auto-migrate SQLite schema to add missing columns if upgrading existing database file
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE analysis_results ADD COLUMN plotly_specs JSON"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(
    title="Agentic LLM Autonomous Data Analyst API",
    description="Multi-agent AI platform leveraging LangGraph, Pandas, OpenAI/Gemini/Ollama, Plotly, ReportLab, and python-docx.",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for direct file serving
app.mount("/charts", StaticFiles(directory=str(CHART_DIR)), name="charts")
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Register API Routes
app.include_router(dataset_routes.router)
app.include_router(analysis_routes.router)
app.include_router(report_routes.router)
app.include_router(chat_routes.router)
app.include_router(settings_routes.router)
app.include_router(agent_routes.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Agentic LLM Autonomous Data Analyst API",
        "version": "2.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
