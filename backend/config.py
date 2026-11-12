import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
REPORT_DIR = BASE_DIR / os.getenv("REPORT_DIR", "reports")
CHART_DIR = BASE_DIR / os.getenv("CHART_DIR", "charts")

for directory in [UPLOAD_DIR, REPORT_DIR, CHART_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///agentic_analyst.db")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
