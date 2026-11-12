import pandas as pd
import numpy as np
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ProfilingAgent:
    """
    ProfilingAgent: Responsibilities:
    1. Detect column data types (Numeric, Categorical, Datetime, Text).
    2. Missing value evaluation per column & overall %.
    3. Find duplicate rows count.
    4. Compute numerical distributions (mean, std, min, 25%, median, 75%, max, skewness).
    5. Evaluate overall Data Health / Quality Score (0 to 100).
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

        total_rows, total_cols = df.shape
        duplicate_count = int(df.duplicated().sum())

        column_details = {}
        missing_summary = {}

        total_cells = total_rows * total_cols if total_cols > 0 else 1
        total_missing_cells = 0

        for col in df.columns:
            dtype_str = str(df[col].dtype)
            null_cnt = int(df[col].isnull().sum())
            null_pct = round((null_cnt / total_rows * 100), 2) if total_rows > 0 else 0
            total_missing_cells += null_cnt

            unique_cnt = int(df[col].nunique())

            if pd.api.types.is_numeric_dtype(df[col]):
                col_type = "Numeric"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                col_type = "Datetime"
            elif unique_cnt < min(20, total_rows * 0.5):
                col_type = "Categorical"
            else:
                col_type = "Text"

            column_details[col] = {
                "dtype": dtype_str,
                "type": col_type,
                "null_count": null_cnt,
                "null_percentage": null_pct,
                "unique_count": unique_cnt,
                "sample_values": df[col].dropna().unique()[:5].tolist()
            }

            if null_cnt > 0:
                missing_summary[col] = {
                    "count": null_cnt,
                    "percentage": null_pct
                }

        # Calculate Data Quality Score (0 - 100)
        # Deductions: Missing cells % (up to -40), Duplicates % (up to -30), Single value columns (up to -30)
        missing_ratio = total_missing_cells / total_cells if total_cells > 0 else 0
        duplicate_ratio = duplicate_count / total_rows if total_rows > 0 else 0

        single_val_cols = sum(1 for c in df.columns if df[c].nunique() == 1)
        single_val_ratio = single_val_cols / total_cols if total_cols > 0 else 0

        quality_score = 100.0 - (missing_ratio * 40.0) - (duplicate_ratio * 30.0) - (single_val_ratio * 30.0)
        quality_score = max(0.0, min(100.0, round(quality_score, 1)))

        # Summary statistics for numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        summary_stats = {}
        if not numeric_df.empty:
            desc = numeric_df.describe().T.to_dict(orient="index")
            for col_name, stats in desc.items():
                summary_stats[col_name] = {k: round(v, 2) if isinstance(v, (int, float)) and not np.isnan(v) else 0 for k, v in stats.items()}

        return {
            "dataset_id": None,
            "column_details": column_details,
            "missing_value_summary": missing_summary,
            "duplicate_rows": duplicate_count,
            "quality_score": quality_score,
            "summary_stats": {
                "shape": [total_rows, total_cols],
                "numeric_descriptors": summary_stats,
                "total_missing_cells": total_missing_cells,
                "total_missing_percentage": round(missing_ratio * 100, 2)
            }
        }

profiling_agent = ProfilingAgent()
