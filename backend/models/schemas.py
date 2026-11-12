from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class CleaningOptions(BaseModel):
    handle_missing: str = Field(default="auto", description="auto, drop, fill_mean, fill_median, fill_mode")
    remove_duplicates: bool = True
    handle_outliers: bool = True
    outlier_threshold: float = 3.0

class DatasetResponse(BaseModel):
    id: str
    filename: str
    filepath: str
    cleaned_filepath: Optional[str] = None
    file_type: str
    file_size_bytes: int
    row_count: int
    column_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    id: str
    dataset_id: str
    column_details: Dict[str, Any]
    missing_value_summary: Dict[str, Any]
    duplicate_rows: int
    quality_score: float
    summary_stats: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    id: str
    dataset_id: str
    domain_category: str
    kpis: Dict[str, Any]
    correlations: Dict[str, Any]
    group_aggregations: Dict[str, Any]
    top_insights: List[str]
    recommendations: List[str]

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: str
    dataset_id: str
    title: str
    pdf_url: Optional[str] = None
    docx_url: Optional[str] = None
    generated_at: datetime

class ChatQueryRequest(BaseModel):
    dataset_id: str
    query: str

class ChatQueryResponse(BaseModel):
    user_query: str
    agent_response: str
    generated_code: Optional[str] = None
    chart_json: Optional[Dict[str, Any]] = None
