import os
import uuid
import logging
from typing import Dict, Any, List
from backend.config import REPORT_DIR
from backend.services.pdf_generator import generate_pdf_report
from backend.services.docx_generator import generate_docx_report

logger = logging.getLogger(__name__)

class ReportAgent:
    """
    ReportAgent: Responsibilities:
    1. Assemble dataset metadata, profile stats, analysis KPIs, embedded charts, insights, and recommendations.
    2. Invoke PDF report builder (`generate_pdf_report`).
    3. Invoke DOCX report builder (`generate_docx_report`).
    4. Save outputs to `reports/` and return absolute file paths and relative URLs.
    """
    def execute(
        self,
        dataset_id: str,
        filename: str,
        row_count: int,
        column_count: int,
        quality_score: float,
        domain_category: str,
        kpis: Dict[str, Any],
        chart_paths: List[str],
        insights: List[str],
        recommendations: List[str]
    ) -> Dict[str, Any]:

        report_title = f"Executive Analytics Report: {filename}"
        base_name = f"report_{dataset_id}"

        pdf_filename = f"{base_name}.pdf"
        docx_filename = f"{base_name}.docx"

        pdf_path = os.path.join(REPORT_DIR, pdf_filename)
        docx_path = os.path.join(REPORT_DIR, docx_filename)

        dataset_info = {
            "filename": filename,
            "row_count": row_count,
            "column_count": column_count
        }

        profile_data = {
            "quality_score": quality_score
        }

        analysis_data = {
            "domain_category": domain_category,
            "kpis": kpis
        }

        # 1. Generate PDF Report
        try:
            generate_pdf_report(
                output_path=pdf_path,
                title=report_title,
                dataset_info=dataset_info,
                profile_data=profile_data,
                analysis_data=analysis_data,
                chart_paths=chart_paths,
                insights=insights,
                recommendations=recommendations
            )
        except Exception as e:
            logger.error(f"ReportAgent failed to generate PDF report: {e}")
            pdf_path = None

        # 2. Generate DOCX Report
        try:
            generate_docx_report(
                output_path=docx_path,
                title=report_title,
                dataset_info=dataset_info,
                profile_data=profile_data,
                analysis_data=analysis_data,
                chart_paths=chart_paths,
                insights=insights,
                recommendations=recommendations
            )
        except Exception as e:
            logger.error(f"ReportAgent failed to generate DOCX report: {e}")
            docx_path = None

        return {
            "report_title": report_title,
            "pdf_path": pdf_path,
            "docx_path": docx_path,
            "pdf_filename": pdf_filename if pdf_path else None,
            "docx_filename": docx_filename if docx_path else None
        }

report_agent = ReportAgent()
