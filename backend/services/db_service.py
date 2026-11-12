import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.database.db_models import Dataset, DataProfile, CleaningLog, AnalysisResult, ReportRecord, ChatMessage
from backend.utils.json_utils import make_json_safe

def create_dataset_record(db: Session, filename: str, filepath: str, file_type: str, file_size_bytes: int, row_count: int, col_count: int) -> Dataset:
    dataset_id = str(uuid.uuid4())
    dataset = Dataset(
        id=dataset_id,
        filename=filename,
        filepath=filepath,
        file_type=file_type,
        file_size_bytes=file_size_bytes,
        row_count=row_count,
        column_count=col_count,
        status="uploaded"
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset

def get_dataset_by_id(db: Session, dataset_id: str) -> Optional[Dataset]:
    return db.query(Dataset).filter(Dataset.id == dataset_id).first()

def get_all_datasets(db: Session) -> List[Dataset]:
    return db.query(Dataset).order_by(Dataset.created_at.desc()).all()

def update_dataset_status(db: Session, dataset_id: str, status: str, cleaned_filepath: Optional[str] = None):
    dataset = get_dataset_by_id(db, dataset_id)
    if dataset:
        dataset.status = status
        if cleaned_filepath:
            dataset.cleaned_filepath = cleaned_filepath
        db.commit()
        db.refresh(dataset)
    return dataset

def save_data_profile(db: Session, dataset_id: str, column_details: dict, missing_summary: dict, duplicate_rows: int, quality_score: float, summary_stats: dict) -> DataProfile:
    profile_id = str(uuid.uuid4())
    # Delete previous profile if exists
    db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).delete()
    profile = DataProfile(
        id=profile_id,
        dataset_id=dataset_id,
        column_details=make_json_safe(column_details),
        missing_value_summary=make_json_safe(missing_summary),
        duplicate_rows=int(duplicate_rows),
        quality_score=float(quality_score),
        summary_stats=make_json_safe(summary_stats)
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def get_data_profile(db: Session, dataset_id: str) -> Optional[DataProfile]:
    return db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).first()

def save_cleaning_log(db: Session, dataset_id: str, actions: dict, rows_before: int, rows_after: int, cols_before: int, cols_after: int) -> CleaningLog:
    log_id = str(uuid.uuid4())
    cleaning_log = CleaningLog(
        id=log_id,
        dataset_id=dataset_id,
        actions_taken=make_json_safe(actions),
        rows_before=rows_before,
        rows_after=rows_after,
        columns_before=cols_before,
        columns_after=cols_after
    )
    db.add(cleaning_log)
    db.commit()
    db.refresh(cleaning_log)
    return cleaning_log

def save_analysis_result(db: Session, dataset_id: str, domain: str, kpis: dict, correlations: dict, group_aggs: dict, top_insights: list, recommendations: list, plotly_specs: list = None) -> AnalysisResult:
    result_id = str(uuid.uuid4())
    db.query(AnalysisResult).filter(AnalysisResult.dataset_id == dataset_id).delete()
    analysis = AnalysisResult(
        id=result_id,
        dataset_id=dataset_id,
        domain_category=domain,
        kpis=make_json_safe(kpis),
        correlations=make_json_safe(correlations),
        group_aggregations=make_json_safe(group_aggs),
        plotly_specs=make_json_safe(plotly_specs or []),
        top_insights=make_json_safe(top_insights),
        recommendations=make_json_safe(recommendations)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

def get_analysis_result(db: Session, dataset_id: str) -> Optional[AnalysisResult]:
    return db.query(AnalysisResult).filter(AnalysisResult.dataset_id == dataset_id).first()

def save_report_record(db: Session, dataset_id: str, title: str, pdf_path: str, docx_path: str, summary: dict) -> ReportRecord:
    report_id = str(uuid.uuid4())
    report = ReportRecord(
        id=report_id,
        dataset_id=dataset_id,
        title=title,
        pdf_path=pdf_path,
        docx_path=docx_path,
        summary=make_json_safe(summary)
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_reports_by_dataset(db: Session, dataset_id: str) -> List[ReportRecord]:
    return db.query(ReportRecord).filter(ReportRecord.dataset_id == dataset_id).order_by(ReportRecord.generated_at.desc()).all()

def save_chat_message(db: Session, dataset_id: str, query: str, response: str, code: Optional[str] = None, chart_json: Optional[dict] = None) -> ChatMessage:
    msg_id = str(uuid.uuid4())
    msg = ChatMessage(
        id=msg_id,
        dataset_id=dataset_id,
        user_query=query,
        agent_response=response,
        generated_code=code,
        chart_json=chart_json
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_chat_history(db: Session, dataset_id: str) -> List[ChatMessage]:
    return db.query(ChatMessage).filter(ChatMessage.dataset_id == dataset_id).order_by(ChatMessage.created_at.asc()).all()
