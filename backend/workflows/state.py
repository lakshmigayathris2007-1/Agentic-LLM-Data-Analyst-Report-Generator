from typing import TypedDict, List, Dict, Any, Optional

class AnalysisState(TypedDict, total=False):
    dataset_id: str
    filename: str
    filepath: str
    cleaned_filepath: Optional[str]
    file_type: str
    file_size_bytes: int
    row_count: int
    column_count: int
    
    # Workflow status
    status: str
    steps_completed: List[str]
    
    # Profile State
    column_details: Dict[str, Any]
    missing_value_summary: Dict[str, Any]
    duplicate_rows: int
    quality_score: float
    summary_stats: Dict[str, Any]

    # Cleaning State
    cleaning_actions: List[str]

    # Analysis State
    domain_category: str
    kpis: Dict[str, Any]
    correlations: Dict[str, Any]
    group_aggregations: Dict[str, Any]

    # Visualization State
    chart_image_paths: List[str]
    plotly_specs: List[Dict[str, Any]]

    # Insights & Reports State
    insights: List[str]
    recommendations: List[str]
    pdf_path: Optional[str]
    docx_path: Optional[str]
    pdf_filename: Optional[str]
    docx_filename: Optional[str]
    report_title: Optional[str]
