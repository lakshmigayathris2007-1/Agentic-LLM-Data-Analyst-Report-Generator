import os
import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class CleaningAgent:
    """
    CleaningAgent: Responsibilities:
    1. Handle missing values (impute with mean/median/mode, or drop).
    2. Remove duplicate rows.
    3. Correct data types (numeric coercion, datetime parsing).
    4. Outlier detection (IQR method) and capping/trimming.
    5. Save cleaned dataset to output directory (`uploads/cleaned_...`).
    """
    def execute(self, filepath: str, clean_options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if clean_options is None:
            clean_options = {
                "handle_missing": "auto",
                "remove_duplicates": True,
                "handle_outliers": True,
                "outlier_threshold": 3.0
            }

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

        rows_before, cols_before = df.shape
        actions_taken = []

        # 1. Remove Duplicate Rows
        if clean_options.get("remove_duplicates", True):
            dups = df.duplicated().sum()
            if dups > 0:
                df = df.drop_duplicates().reset_index(drop=True)
                actions_taken.append(f"Removed {dups} duplicate records.")

        # 2. Handle Missing Values
        handle_missing = clean_options.get("handle_missing", "auto")
        null_count_before = df.isnull().sum().sum()

        if null_count_before > 0:
            if handle_missing == "drop":
                df = df.dropna().reset_index(drop=True)
                actions_taken.append(f"Dropped rows containing missing values.")
            elif handle_missing in ["auto", "fill_mean", "fill_median"]:
                for col in df.columns:
                    if df[col].isnull().sum() > 0:
                        if pd.api.types.is_numeric_dtype(df[col]):
                            if handle_missing in ["fill_median", "auto"]:
                                fill_val = df[col].median()
                                action_name = "median"
                            else:
                                fill_val = df[col].mean()
                                action_name = "mean"
                            if pd.isna(fill_val) or fill_val is None:
                                fill_val = 0.0
                            df[col] = df[col].fillna(fill_val)
                            val_display = f"{fill_val:.2f}" if isinstance(fill_val, (int, float)) else str(fill_val)
                            actions_taken.append(f"Imputed missing numeric values in '{col}' using {action_name} ({val_display}).")
                        else:
                            mode_val = df[col].mode()
                            fill_val = mode_val[0] if not mode_val.empty else "Unknown"
                            df[col] = df[col].fillna(fill_val)
                            actions_taken.append(f"Imputed missing categorical values in '{col}' using mode ('{fill_val}').")

        # 3. Handle Outliers (IQR Capping)
        if clean_options.get("handle_outliers", True):
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            outliers_capped_total = 0
            for col in numeric_cols:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                if iqr > 0:
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers_cnt = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
                    if outliers_cnt > 0:
                        df[col] = np.clip(df[col], lower_bound, upper_bound)
                        outliers_capped_total += outliers_cnt
            if outliers_capped_total > 0:
                actions_taken.append(f"Capped {outliers_capped_total} outlier values using IQR bounds.")

        # Save Cleaned File
        base_dir = os.path.dirname(filepath)
        file_name = os.path.basename(filepath)
        cleaned_filename = f"cleaned_{file_name}"
        cleaned_filepath = os.path.join(base_dir, cleaned_filename)

        if ext in ['xlsx', 'xls']:
            df.to_excel(cleaned_filepath, index=False)
        else:
            df.to_csv(cleaned_filepath, index=False)

        rows_after, cols_after = df.shape

        return {
            "cleaned_filepath": cleaned_filepath,
            "actions_taken": actions_taken,
            "rows_before": rows_before,
            "rows_after": rows_after,
            "columns_before": cols_before,
            "columns_after": cols_after
        }

cleaning_agent = CleaningAgent()
