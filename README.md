<<<<<<< HEAD
# Agentic LLM for Autonomous Data Analysis and Report Generation

An end-to-end multi-agent AI system that autonomously analyzes uploaded datasets, generates executive insights, creates static & interactive visualizations, provides natural language querying via Pandas execution chains, and exports corporate PDF and DOCX reports without requiring manual analysis.

---

## 1. System Architecture & Workflow Diagram

```
                               ┌──────────────────────────────────────────────┐
                               │           React + Tailwind Frontend          │
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTP / REST APIs (Axios)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │          FastAPI Backend Controller          │
                               └──────────────────────┬───────────────────────┘
                                                      │ State Graph Invocation
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     LangGraph Multi-Agent Orchestrator                                       │
│                                                                                                             │
│ ┌────────────────┐   ┌──────────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌────────────────┐ │
│ │ IngestionAgent │──>│ ProfilingAgent   │──>│ CleaningAgent   │──>│ AnalysisAgent    │──>│ Visualization  │ │
│ │(Format & Read) │   │ (Quality Score)  │   │(Missing/Outlier)│   │ (Domain & KPIs)  │   │     Agent      │ │
│ └────────────────┘   └──────────────────┘   └─────────────────┘   └──────────────────┘   └───────┬────────┘ │
│                                                                                                  │          │
│ ┌────────────────┐   ┌──────────────────┐   ┌─────────────────┐                                  │          │
│ │   ChatAgent    │   │   ReportAgent    │<──│  InsightAgent   │<─────────────────────────────────┘          │
│ │ (NL to Pandas) │   │  (PDF & DOCX)    │   │ (LLM Summary)   │                                             │
│ └────────────────┘   └──────────────────┘   └─────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │  Storage: MySQL / SQLite DB | Charts | Reports│
                               └──────────────────────────────────────────────┘
```

---

## 2. Multi-Agent Breakdown (8 Autonomous Agents)

1. **IngestionAgent** (`backend/agents/ingestion_agent.py`): Validates file format (CSV, Excel `.xlsx`/`.xls`, JSON), stores raw file securely in `uploads/`, reads DataFrame, and extracts base row/col metadata.
2. **ProfilingAgent** (`backend/agents/profiling_agent.py`): Performs column type detection, null count & %, duplicate record search, summary stats, and computes a 0-100% **Data Quality Score**.
3. **CleaningAgent** (`backend/agents/cleaning_agent.py`): Handles missing values (impute mean/median/mode/drop), removes duplicates, caps outliers using IQR bounds, and exports cleaned CSV/Excel files.
4. **AnalysisAgent** (`backend/agents/analysis_agent.py`): Classifies dataset domain (Sales, HR, Finance, Marketing, Healthcare, Education, E-Commerce), computes domain KPIs, correlation matrices, and group aggregations.
5. **VisualizationAgent** (`backend/agents/visualization_agent.py`): Generates static high-res PNG charts (Matplotlib/Seaborn) for report embedding and interactive Plotly JSON specs for the frontend (Bar, Pie, Line, Histogram, Heatmap, Scatter).
6. **InsightAgent** (`backend/agents/insight_agent.py`): Interfaces with OpenAI GPT-4o (or intelligent rule fallback) to extract key business insights, trend discoveries, anomaly highlights, and strategic recommendations.
7. **ReportAgent** (`backend/agents/report_agent.py`): Compiles structured executive **PDF** (`ReportLab`) and **DOCX** (`python-docx`) reports containing summary cards, quality metrics, tables, embedded charts, and recommendations.
8. **ChatAgent** (`backend/agents/chat_agent.py`): Translates natural language user questions into Pandas execution code, runs it safely in an isolated namespace, and returns numerical/text answers + dynamic charts.

---

## 3. Database Schema (MySQL & SQLite Compatible)

Defined in [`schema.sql`](file:///d:/AI%20PROJECt/schema.sql) and [`backend/database/db_models.py`](file:///d:/AI%20PROJECt/backend/database/db_models.py):

* **`datasets`**: Stores dataset metadata (id, filename, filepath, cleaned_filepath, file_type, size, row_count, col_count, status).
* **`data_profiles`**: Stores column data types, missing value summaries, duplicate counts, quality scores, and summary stats.
* **`cleaning_logs`**: Logs actions taken, row/col count diffs before and after cleaning.
* **`analysis_results`**: Stores domain category, computed KPIs, correlations, group aggregations, insights, and recommendations.
* **`reports`**: Tracks generated PDF and DOCX report titles and file paths.
* **`chat_history`**: Records natural language queries, LLM response strings, executed Pandas python code, and dynamic Plotly chart JSONs.

---

## 4. REST API Endpoint Design

### Datasets & Profiling (`/api/datasets`)
* `POST /api/datasets/upload` — Upload CSV, Excel, or JSON dataset.
* `GET /api/datasets/` — List all uploaded datasets.
* `GET /api/datasets/{id}` — Get dataset details and data profile.
* `GET /api/datasets/{id}/preview` — Tabular row preview (raw or cleaned).
* `POST /api/datasets/{id}/clean` — Trigger data cleaning with custom options.

### Analysis Workflow (`/api/analysis`)
* `POST /api/analysis/run/{dataset_id}` — Trigger complete 8-agent LangGraph workflow execution.
* `GET /api/analysis/{dataset_id}/results` — Retrieve computed KPIs, domain category, Plotly specs, insights, and recommendations.

### Reports (`/api/reports`)
* `GET /api/reports/{dataset_id}` — Get report records for dataset.
* `GET /api/reports/download/{filename}` — Download generated PDF or DOCX report.

### Chat With Data (`/api/chat`)
* `POST /api/chat/query` — Execute natural language query on dataset.
* `GET /api/chat/history/{dataset_id}` — Fetch conversation chat history.

---

## 5. Getting Started & Installation

### Prerequisites
* Python 3.9+
* Node.js 18+ & npm
* MySQL Server (Optional — system automatically falls back to zero-config SQLite if MySQL is offline!)

### Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
DATABASE_URL=sqlite:///agentic_analyst.db
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
```

---

## 6. Running the Project

### Step 1: Start Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend API will run at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).*

### Step 2: Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend dashboard will run at `http://localhost:3000`.*

---

## 7. Deployment Guide

1. **Docker Containerization**:
   - Backend: Containerize using `python:3.10-slim`, install `gobject-introspection` and build tools for ReportLab.
   - Frontend: Build static assets using `npm run build` and serve via Nginx.
2. **Database Migration**:
   - Run `schema.sql` on target MySQL database instance (e.g. AWS RDS, MySQL Server).
3. **Environment Production Flags**:
   - Set `DATABASE_URL=mysql+pymysql://user:password@host:3306/agentic_analyst`
   - Set `OPENAI_API_KEY` for GPT-4o production inference.
=======
# Agentic-LLM-Data-Analyst-Report-Generator
An Agentic LLM-powered Data Analyst that automates data cleaning, exploratory data analysis, visualization, insight generation, and report creation using intelligent AI agents.
>>>>>>> origin/main
