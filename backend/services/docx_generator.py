import os
import logging
from typing import Dict, Any, List
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

logger = logging.getLogger(__name__)

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def generate_docx_report(
    output_path: str,
    title: str,
    dataset_info: Dict[str, Any],
    profile_data: Dict[str, Any],
    analysis_data: Dict[str, Any],
    chart_paths: List[str],
    insights: List[str],
    recommendations: List[str]
) -> str:
    """
    Generates a executive DOCX report using python-docx.
    """
    doc = Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Document Header Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run_title = title_p.add_run(title)
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(30, 41, 59)

    sub_p = doc.add_paragraph()
    run_sub = sub_p.add_run("Autonomous Multi-Agent AI Data Analytics & Insights Report")
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(12)
    run_sub.font.color.rgb = RGBColor(37, 99, 235)
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 1: Executive Summary
    h1 = doc.add_heading("1. Executive Summary", level=1)
    h1.style.font.color.rgb = RGBColor(30, 41, 59)

    filename = dataset_info.get("filename", "Dataset")
    row_count = dataset_info.get("row_count", 0)
    col_count = dataset_info.get("column_count", 0)
    domain = analysis_data.get("domain_category", "General")
    quality_score = profile_data.get("quality_score", 0.0)

    p_exec = doc.add_paragraph()
    p_exec.add_run("This automated report presents quantitative analysis for dataset ")
    r_bold1 = p_exec.add_run(f"'{filename}'")
    r_bold1.bold = True
    p_exec.add_run(". Classified under domain ")
    r_bold2 = p_exec.add_run(f"'{domain}'")
    r_bold2.bold = True
    p_exec.add_run(f", containing {row_count:,} rows and {col_count} columns with Data Quality Score of ")
    r_bold3 = p_exec.add_run(f"{quality_score:.1f}/100.")
    r_bold3.bold = True

    # Summary Table
    table = doc.add_table(rows=6, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    headers = ["Metric", "Value", "Context"]
    data = [
        ["Dataset Name", str(filename), "Uploaded File"],
        ["Domain Category", str(domain), "Automated Classification"],
        ["Total Row Count", f"{row_count:,}", "Parsed Records"],
        ["Total Column Count", str(col_count), "Attributes"],
        ["Data Quality Score", f"{quality_score:.1f} / 100", "Health Assessment"]
    ]

    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.text = h
        set_cell_background(cell, "F1F5F9")
        cell.paragraphs[0].runs[0].font.bold = True

    for i, row in enumerate(data):
        for j, val in enumerate(row):
            table.cell(i + 1, j).text = val

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 2: KPIs & Analytics
    h2 = doc.add_heading("2. Key Analytics & Computed KPIs", level=1)
    h2.style.font.color.rgb = RGBColor(30, 41, 59)

    kpis = analysis_data.get("kpis", {})
    if kpis:
        kpi_table = doc.add_table(rows=len(kpis) + 1, cols=2)
        kpi_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        kpi_table.style = 'Table Grid'
        
        kpi_table.cell(0, 0).text = "KPI Metric Name"
        kpi_table.cell(0, 1).text = "Computed Value"
        set_cell_background(kpi_table.cell(0, 0), "F1F5F9")
        set_cell_background(kpi_table.cell(0, 1), "F1F5F9")
        kpi_table.cell(0, 0).paragraphs[0].runs[0].font.bold = True
        kpi_table.cell(0, 1).paragraphs[0].runs[0].font.bold = True

        for idx, (k, v) in enumerate(kpis.items(), start=1):
            kpi_table.cell(idx, 0).text = k.replace('_', ' ').title()
            kpi_table.cell(idx, 1).text = f"{v:,.2f}" if isinstance(v, (int, float)) else str(v)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 3: Visualizations
    if chart_paths:
        h3 = doc.add_heading("3. Data Visualizations & Charts", level=1)
        h3.style.font.color.rgb = RGBColor(30, 41, 59)

        for img_path in chart_paths[:4]:
            if os.path.exists(img_path):
                try:
                    doc.add_picture(img_path, width=Inches(6.0))
                    p_sp = doc.add_paragraph()
                    p_sp.paragraph_format.space_after = Pt(12)
                except Exception as e:
                    logger.warning(f"Could not embed chart {img_path} in DOCX: {e}")

    # Section 4: Key Insights
    h4 = doc.add_heading("4. Key Analytical Insights", level=1)
    h4.style.font.color.rgb = RGBColor(30, 41, 59)
    for insight in insights:
        doc.add_paragraph(insight, style='List Bullet')

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 5: Recommendations
    h5 = doc.add_heading("5. Strategic Recommendations", level=1)
    h5.style.font.color.rgb = RGBColor(30, 41, 59)
    for rec in recommendations:
        doc.add_paragraph(rec, style='List Bullet')

    doc.save(output_path)
    logger.info(f"Successfully generated DOCX report at {output_path}")
    return output_path
