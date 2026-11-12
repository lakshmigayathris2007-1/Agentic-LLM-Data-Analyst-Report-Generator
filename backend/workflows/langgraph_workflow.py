import logging
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from backend.workflows.state import AnalysisState
from backend.agents.ingestion_agent import ingestion_agent
from backend.agents.profiling_agent import profiling_agent
from backend.agents.cleaning_agent import cleaning_agent
from backend.agents.analysis_agent import analysis_agent
from backend.agents.visualization_agent import visualization_agent
from backend.agents.insight_agent import insight_agent
from backend.agents.report_agent import report_agent

logger = logging.getLogger(__name__)

def node_ingestion(state: AnalysisState) -> AnalysisState:
    logger.info("Executing IngestionAgent Node")
    filepath = state["filepath"]
    ingest_res = ingestion_agent.execute(filepath)
    
    steps = state.get("steps_completed", [])
    steps.append("Ingestion")

    return {
        **state,
        "file_type": ingest_res["file_type"],
        "file_size_bytes": ingest_res["file_size_bytes"],
        "row_count": ingest_res["row_count"],
        "column_count": ingest_res["column_count"],
        "steps_completed": steps
    }

def node_profiling(state: AnalysisState) -> AnalysisState:
    logger.info("Executing ProfilingAgent Node")
    filepath = state.get("cleaned_filepath") or state["filepath"]
    profile_res = profiling_agent.execute(filepath)

    steps = state.get("steps_completed", [])
    steps.append("Profiling")

    return {
        **state,
        "column_details": profile_res["column_details"],
        "missing_value_summary": profile_res["missing_value_summary"],
        "duplicate_rows": profile_res["duplicate_rows"],
        "quality_score": profile_res["quality_score"],
        "summary_stats": profile_res["summary_stats"],
        "steps_completed": steps
    }

def node_cleaning(state: AnalysisState) -> AnalysisState:
    logger.info("Executing CleaningAgent Node")
    filepath = state["filepath"]
    clean_res = cleaning_agent.execute(filepath)

    steps = state.get("steps_completed", [])
    steps.append("Cleaning")

    return {
        **state,
        "cleaned_filepath": clean_res["cleaned_filepath"],
        "cleaning_actions": clean_res["actions_taken"],
        "row_count": clean_res["rows_after"],
        "column_count": clean_res["columns_after"],
        "steps_completed": steps
    }

def node_analysis(state: AnalysisState) -> AnalysisState:
    logger.info("Executing AnalysisAgent Node")
    filepath = state.get("cleaned_filepath") or state["filepath"]
    analysis_res = analysis_agent.execute(filepath)

    steps = state.get("steps_completed", [])
    steps.append("Analysis")

    return {
        **state,
        "domain_category": analysis_res["domain_category"],
        "kpis": analysis_res["kpis"],
        "correlations": analysis_res["correlations"],
        "group_aggregations": analysis_res["group_aggregations"],
        "steps_completed": steps
    }

def node_visualization(state: AnalysisState) -> AnalysisState:
    logger.info("Executing VisualizationAgent Node")
    filepath = state.get("cleaned_filepath") or state["filepath"]
    dataset_id = state.get("dataset_id", "default")
    vis_res = visualization_agent.execute(filepath, dataset_id)

    steps = state.get("steps_completed", [])
    steps.append("Visualization")

    return {
        **state,
        "chart_image_paths": vis_res["chart_image_paths"],
        "plotly_specs": vis_res["plotly_specs"],
        "steps_completed": steps
    }

def node_insight(state: AnalysisState) -> AnalysisState:
    logger.info("Executing InsightAgent Node")
    insight_res = insight_agent.execute(
        domain_category=state.get("domain_category", "General"),
        summary_stats=state.get("summary_stats", {}),
        kpis=state.get("kpis", {}),
        quality_score=state.get("quality_score", 100.0)
    )

    steps = state.get("steps_completed", [])
    steps.append("Insight")

    return {
        **state,
        "insights": insight_res["insights"],
        "recommendations": insight_res["recommendations"],
        "steps_completed": steps
    }

def node_report(state: AnalysisState) -> AnalysisState:
    logger.info("Executing ReportAgent Node")
    report_res = report_agent.execute(
        dataset_id=state.get("dataset_id", "default"),
        filename=state.get("filename", "dataset"),
        row_count=state.get("row_count", 0),
        column_count=state.get("column_count", 0),
        quality_score=state.get("quality_score", 100.0),
        domain_category=state.get("domain_category", "General"),
        kpis=state.get("kpis", {}),
        chart_paths=state.get("chart_image_paths", []),
        insights=state.get("insights", []),
        recommendations=state.get("recommendations", [])
    )

    steps = state.get("steps_completed", [])
    steps.append("Report")

    return {
        **state,
        "pdf_path": report_res["pdf_path"],
        "docx_path": report_res["docx_path"],
        "pdf_filename": report_res["pdf_filename"],
        "docx_filename": report_res["docx_filename"],
        "report_title": report_res["report_title"],
        "status": "completed",
        "steps_completed": steps
    }

# Build LangGraph Workflow
builder = StateGraph(AnalysisState)

builder.add_node("ingestion", node_ingestion)
builder.add_node("profiling", node_profiling)
builder.add_node("cleaning", node_cleaning)
builder.add_node("analysis", node_analysis)
builder.add_node("visualization", node_visualization)
builder.add_node("insight", node_insight)
builder.add_node("report", node_report)

# Wire workflow pipeline
builder.set_entry_point("ingestion")
builder.add_edge("ingestion", "profiling")
builder.add_edge("profiling", "cleaning")
builder.add_edge("cleaning", "analysis")
builder.add_edge("analysis", "visualization")
builder.add_edge("visualization", "insight")
builder.add_edge("insight", "report")
builder.add_edge("report", END)

# Compile Graph
workflow_graph = builder.compile()

def run_analysis_workflow(initial_state: AnalysisState) -> AnalysisState:
    """
    Triggers complete multi-agent LangGraph workflow execution.
    """
    logger.info(f"Starting LangGraph workflow for dataset {initial_state.get('dataset_id')}")
    final_state = workflow_graph.invoke(initial_state)
    return final_state
