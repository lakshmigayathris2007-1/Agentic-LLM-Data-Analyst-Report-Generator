import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, List
from backend.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class AnalysisAgent:
    """
    AnalysisAgent: Responsibilities:
    1. Classify dataset domain category (Sales, HR, Finance, Marketing, Healthcare, Education, E-Commerce).
    2. Select and compute relevant KPIs and domain-specific summary metrics.
    3. Calculate feature correlation matrix for numeric variables.
    4. Perform multi-dimensional group-by aggregations.
    """
    def execute(self, filepath: str) -> Dict[str, Any]:
        ext = filepath.split('.')[-1].lower()
        if ext == 'csv':
            try:
                df = pd.read_csv(filepath)
            except UnicodeDecodeError:
                df = pd.read_csv(filepath, encoding='latin-1')
        elif ext in ['xlsx', 'xls']:
            df = pd.read_excel(filepath)
        elif ext == 'json':
            df = pd.read_json(filepath)
        else:
            df = pd.read_csv(filepath)

        columns = list(df.columns)
        sample_head = df.head(3).to_dict(orient="records")

        # 1. Classify Domain Category
        domain_category = llm_service.classify_domain(columns, sample_head)

        # 2. Compute Quantitative KPIs
        kpis = {}
        numeric_df = df.select_dtypes(include=[np.number])
        cat_df = df.select_dtypes(include=['object', 'category', 'string'])

        if not numeric_df.empty:
            for col in numeric_df.columns:
                col_lower = col.lower()
                total_val = float(numeric_df[col].sum())
                avg_val = float(numeric_df[col].mean())
                max_val = float(numeric_df[col].max())
                min_val = float(numeric_df[col].min())

                if any(k in col_lower for k in ['revenue', 'sales', 'profit', 'amount', 'salary', 'price', 'cost']):
                    kpis[f"total_{col_lower}"] = round(total_val, 2)
                    kpis[f"avg_{col_lower}"] = round(avg_val, 2)
                elif any(k in col_lower for k in ['rate', 'pct', 'percentage', 'ratio', 'score', 'gpa']):
                    kpis[f"avg_{col_lower}"] = round(avg_val, 2)
                else:
                    kpis[f"mean_{col_lower}"] = round(avg_val, 2)
                    kpis[f"max_{col_lower}"] = round(max_val, 2)

        # Domain specific KPI enrichments
        if domain_category == "HR" and not cat_df.empty:
            if 'department' in [c.lower() for c in cat_df.columns]:
                dept_col = [c for c in cat_df.columns if c.lower() == 'department'][0]
                kpis["department_count"] = int(df[dept_col].nunique())

        if "total_records" not in kpis:
            kpis["total_records"] = len(df)

        # 3. Compute Correlation Matrix
        correlations = {}
        if numeric_df.shape[1] >= 2:
            corr_matrix = numeric_df.corr().fillna(0).round(3)
            correlations = corr_matrix.to_dict()

        # 4. Compute Group Aggregations
        group_aggregations = {}
        if not cat_df.empty and not numeric_df.empty:
            primary_cat = cat_df.columns[0]
            primary_num = numeric_df.columns[0]

            grp = df.groupby(primary_cat)[primary_num].agg(['count', 'sum', 'mean']).reset_index()
            grp = grp.sort_values(by='sum', ascending=False).head(10)
            
            group_aggregations[f"{primary_cat}_by_{primary_num}"] = {
                "category_column": primary_cat,
                "numeric_column": primary_num,
                "data": grp.round(2).to_dict(orient="records")
            }

        return {
            "domain_category": domain_category,
            "kpis": kpis,
            "correlations": correlations,
            "group_aggregations": group_aggregations
        }

analysis_agent = AnalysisAgent()
