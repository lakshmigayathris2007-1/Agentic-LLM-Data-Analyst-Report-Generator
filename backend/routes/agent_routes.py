from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services import db_service
from backend.agents.ingestion_agent import ingestion_agent
from backend.agents.profiling_agent import profiling_agent
from backend.agents.cleaning_agent import cleaning_agent
from backend.agents.analysis_agent import analysis_agent
from backend.agents.visualization_agent import visualization_agent
from backend.agents.insight_agent import insight_agent
from backend.agents.report_agent import report_agent
from backend.agents.chat_agent import chat_agent
from backend.services.llm_service import llm_service

router = APIRouter(prefix="/api/agents", tags=["AI Agents Command Center"])

AGENTS_METADATA = [
    {
        "id": "ingestion",
        "name": "IngestionAgent",
        "role": "Format Validation & Secure Storage",
        "description": "Validates incoming CSV, Excel, and JSON data sources. Reads initial schema and extracts metadata.",
        "type": "Data Ingestion Agent",
        "icon": "Database"
    },
    {
        "id": "profiling",
        "name": "ProfilingAgent",
        "role": "Data Quality Assessment & Stats",
        "description": "Detects column data types, computes null value %, identifies duplicate rows, and scores overall Data Health (0-100%).",
        "type": "Data Quality Agent",
        "icon": "Activity"
    },
    {
        "id": "cleaning",
        "name": "CleaningAgent",
        "role": "Autonomous Data Hygiene & Outlier Repair",
        "description": "Imputes missing numerical/categorical values, eliminates duplicate rows, and caps outlier distributions using IQR rules.",
        "type": "Data Preprocessing Agent",
        "icon": "Sparkles"
    },
    {
        "id": "analysis",
        "name": "AnalysisAgent",
        "role": "Domain Classification & KPI Engine",
        "description": "Classifies business domain (Sales, HR, Healthcare, Finance, etc.), calculates statistical correlation matrix, and domain KPIs.",
        "type": "Analytics & Statistics Agent",
        "icon": "TrendingUp"
    },
    {
        "id": "visualization",
        "name": "VisualizationAgent",
        "role": "Chart Generator (Plotly & Static PNG)",
        "description": "Renders interactive Plotly JSON chart specifications and generates executive static PNG figures for corporate reports.",
        "type": "Visualization Agent",
        "icon": "PieChart"
    },
    {
        "id": "insight",
        "name": "InsightAgent",
        "role": "LLM Executive Insights & Recommendations",
        "description": "Synthesizes statistical analytics and KPIs via LLM (OpenAI/Gemini/Ollama) to formulate strategic recommendations.",
        "type": "Executive Reasoning Agent",
        "icon": "Brain"
    },
    {
        "id": "report",
        "name": "ReportAgent",
        "role": "Corporate Document Builder (PDF & DOCX)",
        "description": "Compiles executive PDF and Word reports containing summary cards, data health metrics, embedded charts, and recommendations.",
        "type": "Document Generation Agent",
        "icon": "FileText"
    },
    {
        "id": "chat",
        "name": "ChatAgent",
        "role": "Natural Language to Pandas & Plotly",
        "description": "Translates human questions into Python Pandas code, executes it safely in an isolated namespace, and plots dynamic charts.",
        "type": "Conversational Code Agent",
        "icon": "MessageSquare"
    }
]

class AgentInteractRequest(BaseModel):
    agent_id: str
    dataset_id: Optional[str] = None
    prompt: Optional[str] = ""

@router.get("/info")
def get_agents_info():
    return {
        "system": "Autonomous 8-Agent Data Analyst Pipeline",
        "agents": AGENTS_METADATA
    }

@router.post("/interact")
def interact_with_agent(req: AgentInteractRequest, db: Session = Depends(get_db)):
    try:
        agent_info = next((a for a in AGENTS_METADATA if a["id"] == req.agent_id), None)
        if not agent_info:
            raise HTTPException(status_code=404, detail="Agent not found")

        # If dataset_id provided, fetch context
        dataset_ctx = ""
        if req.dataset_id and req.dataset_id != "undefined" and req.dataset_id != "null":
            try:
                ds = db_service.get_dataset_by_id(db, req.dataset_id)
                if ds:
                    dataset_ctx = f"Dataset: {ds.filename} ({ds.row_count} rows, {ds.column_count} cols, type: {ds.file_type})."
            except Exception:
                pass

        # Query LLM in role of specified Agent
        system_prompt = (
            f"You are the {agent_info['name']} ({agent_info['role']}) in an Autonomous Multi-Agent Data Analyst System.\n"
            f"Description: {agent_info['description']}.\n"
            f"{dataset_ctx}\n"
            f"User Message: {req.prompt}\n\n"
            f"Respond concisely as this agent, explaining what actions you perform, data insights, or answers related to your specialty."
        )

        if llm_service.provider != "fallback":
            try:
                resp = llm_service._call_llm_raw(system_prompt)
                if resp and len(resp.strip()) > 0:
                    return {
                        "agent_id": req.agent_id,
                        "agent_name": agent_info["name"],
                        "role": agent_info["role"],
                        "response": resp
                    }
            except Exception as e:
                pass

        # Fallback Agent Response
        ctx_msg = f" Context: {dataset_ctx}." if dataset_ctx else ""
        return {
            "agent_id": req.agent_id,
            "agent_name": agent_info["name"],
            "role": agent_info["role"],
            "response": f"Greetings! I am the {agent_info['name']}. {agent_info['description']}{ctx_msg} Regarding your query '{req.prompt}', I am active and ready to process your dataset."
        }
    except HTTPException:
        raise
    except Exception as err:
        return {
            "agent_id": req.agent_id,
            "agent_name": req.agent_id,
            "role": "Agent",
            "response": f"Agent is active. Prompt received: '{req.prompt}'."
        }
