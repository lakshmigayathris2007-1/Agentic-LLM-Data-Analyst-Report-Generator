import os
import logging
from typing import Dict, Any, List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

logger = logging.getLogger(__name__)

def generate_pdf_report(
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
    Generates a professional executive PDF report using ReportLab.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#1E293B")    # Dark slate
    SECONDARY = colors.HexColor("#2563EB")  # Vivid Blue
    ACCENT = colors.HexColor("#0EA5E9")     # Cyan
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Soft gray
    TEXT_DARK = colors.HexColor("#334155")  # Charcoal

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=SECONDARY,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=4
    )

    elements = []

    # Title Header
    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph("Autonomous Multi-Agent AI Data Analytics & Insights Report", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=0, spaceAfter=15))

    # Section 1: Executive Summary & Overview
    elements.append(Paragraph("1. Executive Summary", h1_style))
    filename = dataset_info.get("filename", "Dataset")
    row_count = dataset_info.get("row_count", 0)
    col_count = dataset_info.get("column_count", 0)
    domain = analysis_data.get("domain_category", "General")
    quality_score = profile_data.get("quality_score", 0.0)

    exec_summary_text = (
        f"This automated executive report presents deep quantitative findings for dataset <b>{filename}</b>. "
        f"The AI multi-agent pipeline categorized this dataset under the <b>{domain}</b> domain. "
        f"The dataset contains <b>{row_count:,}</b> records and <b>{col_count}</b> attributes. "
        f"Overall Data Hygiene & Health Score is evaluated at <b>{quality_score:.1f} / 100</b>."
    )
    elements.append(Paragraph(exec_summary_text, body_style))
    elements.append(Spacer(1, 10))

    # Quick Stats Table
    stats_data = [
        [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Value</b>", body_style), Paragraph("<b>Status / Context</b>", body_style)],
        [Paragraph("Dataset Name", body_style), Paragraph(str(filename), body_style), Paragraph("Active File", body_style)],
        [Paragraph("Domain Category", body_style), Paragraph(str(domain), body_style), Paragraph("Automated Detection", body_style)],
        [Paragraph("Total Rows", body_style), Paragraph(f"{row_count:,}", body_style), Paragraph("Records parsed", body_style)],
        [Paragraph("Total Columns", body_style), Paragraph(f"{col_count}", body_style), Paragraph("Attribute dimensions", body_style)],
        [Paragraph("Data Quality Score", body_style), Paragraph(f"{quality_score:.1f} / 100", body_style), Paragraph("Automated Assessment", body_style)],
    ]
    t = Table(stats_data, colWidths=[2.2 * inch, 2.2 * inch, 2.6 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_LIGHT),
        ('TEXTCOLOR', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 15))

    # Section 2: Key Analytics & KPIs
    elements.append(Paragraph("2. Key Analytics & Computed KPIs", h1_style))
    kpis = analysis_data.get("kpis", {})
    if kpis:
        kpi_rows = [[Paragraph("<b>KPI Name</b>", body_style), Paragraph("<b>Computed Value</b>", body_style)]]
        for k, v in kpis.items():
            val_str = f"{v:,.2f}" if isinstance(v, (int, float)) else str(v)
            kpi_rows.append([Paragraph(k.replace('_', ' ').title(), body_style), Paragraph(val_str, body_style)])
        
        t_kpi = Table(kpi_rows, colWidths=[3.5 * inch, 3.5 * inch])
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), BG_LIGHT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t_kpi)
    else:
        elements.append(Paragraph("No numeric KPIs computed.", body_style))
    elements.append(Spacer(1, 15))

    # Section 3: Visualizations
    if chart_paths:
        elements.append(Paragraph("3. Data Visualizations & Charts", h1_style))
        for img_path in chart_paths[:4]:
            if os.path.exists(img_path):
                try:
                    elements.append(Image(img_path, width=6.5 * inch, height=3.2 * inch))
                    elements.append(Spacer(1, 10))
                except Exception as e:
                    logger.warning(f"Could not embed chart {img_path} in PDF: {e}")

    # Section 4: Key Insights
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("4. Key Analytical Insights", h1_style))
    for insight in insights:
        elements.append(Paragraph(f"• {insight}", bullet_style))
    elements.append(Spacer(1, 10))

    # Section 5: Strategic Recommendations
    elements.append(Paragraph("5. Strategic Recommendations", h1_style))
    for rec in recommendations:
        elements.append(Paragraph(f"• {rec}", bullet_style))

    # Build Document
    doc.build(elements)
    logger.info(f"Successfully generated PDF report at {output_path}")
    return output_path
