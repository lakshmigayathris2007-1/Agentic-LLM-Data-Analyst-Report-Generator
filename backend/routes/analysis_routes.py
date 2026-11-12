from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services import db_service
from backend.workflows.langgraph_workflow import run_analysis_workflow
from backend.utils.json_utils import make_json_safe

router = APIRouter(prefix="/api/analysis", tags=["Analysis Workflow"])

@router.post("/run/{dataset_id}")
def run_dataset_analysis(dataset_id: str, db: Session = Depends(get_db)):
    """
    Triggers full autonomous multi-agent LangGraph workflow execution.
    """
    dataset = db_service.get_dataset_by_id(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    initial_state = {
        "dataset_id": dataset.id,
        "filename": dataset.filename,
        "filepath": dataset.filepath,
        "cleaned_filepath": dataset.cleaned_filepath,
        "file_type": dataset.file_type,
        "file_size_bytes": dataset.file_size_bytes,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "status": "processing",
        "steps_completed": []
    }

    try:
        final_state = run_analysis_workflow(initial_state)

        # Save Analysis Results into Database
        db_service.save_analysis_result(
            db=db,
            dataset_id=dataset.id,
            domain=final_state.get("domain_category", "General"),
            kpis=final_state.get("kpis", {}),
            correlations=final_state.get("correlations", {}),
            group_aggs=final_state.get("group_aggregations", {}),
            top_insights=final_state.get("insights", []),
            recommendations=final_state.get("recommendations", []),
            plotly_specs=final_state.get("plotly_specs", [])
        )

        # Save Report Record
        if final_state.get("pdf_path") or final_state.get("docx_path"):
            db_service.save_report_record(
                db=db,
                dataset_id=dataset.id,
                title=final_state.get("report_title", f"Report for {dataset.filename}"),
                pdf_path=final_state.get("pdf_path"),
                docx_path=final_state.get("docx_path"),
                summary={"domain": final_state.get("domain_category"), "quality_score": final_state.get("quality_score")}
            )

        db_service.update_dataset_status(db, dataset.id, "analyzed")

        return make_json_safe({
            "message": "Autonomous multi-agent workflow completed successfully.",
            "status": "completed",
            "steps_completed": final_state.get("steps_completed", []),
            "domain_category": final_state.get("domain_category"),
            "kpis": final_state.get("kpis"),
            "plotly_specs": final_state.get("plotly_specs"),
            "insights": final_state.get("insights"),
            "recommendations": final_state.get("recommendations"),
            "pdf_filename": final_state.get("pdf_filename"),
            "docx_filename": final_state.get("docx_filename")
        })
    except Exception as e:
        db_service.update_dataset_status(db, dataset.id, "failed")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.get("/{dataset_id}/results")
def get_analysis_results(dataset_id: str, db: Session = Depends(get_db)):
    analysis = db_service.get_analysis_result(db, dataset_id)
    dataset = db_service.get_dataset_by_id(db, dataset_id)
    profile = db_service.get_data_profile(db, dataset_id)

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis results not found. Trigger workflow analysis first.")

    return {
        "dataset": dataset,
        "profile": profile,
        "analysis": analysis
    }
