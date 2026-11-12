import os
import logging
import pandas as pd
from typing import Dict, Any

logger = logging.getLogger(__name__)

class IngestionAgent:
    """
    IngestionAgent: Responsibilities:
    1. Validate dataset format (CSV, Excel, JSON).
    2. Read data into pandas DataFrame securely.
    3. Return file metadata (row count, column count, file size, columns, sample data).
    """
    def execute(self, filepath: str) -> Dict[str, Any]:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Uploaded file not found at: {filepath}")

        file_size = os.path.getsize(filepath)
        ext = os.path.splitext(filepath)[1].lower()

        try:
            if ext == '.csv':
                # Attempt standard UTF-8 parsing, fallback to latin-1 if encoding issues arise
                try:
                    df = pd.read_csv(filepath)
                except UnicodeDecodeError:
                    df = pd.read_csv(filepath, encoding='latin-1')
            elif ext in ['.xlsx', '.xls']:
                df = pd.read_excel(filepath)
            elif ext == '.json':
                df = pd.read_json(filepath)
            else:
                raise ValueError(f"Unsupported file format extension: '{ext}'. Allowed: CSV, XLSX, XLS, JSON.")
        except Exception as e:
            logger.error(f"IngestionAgent error parsing dataset file '{filepath}': {e}")
            raise RuntimeError(f"Failed to ingest dataset: {str(e)}")

        row_count, column_count = df.shape
        columns = list(df.columns)
        sample_rows = df.head(5).to_dict(orient="records")

        return {
            "filepath": filepath,
            "file_type": ext.replace('.', '').upper(),
            "file_size_bytes": file_size,
            "row_count": row_count,
            "column_count": column_count,
            "columns": columns,
            "sample_head": sample_rows
        }

ingestion_agent = IngestionAgent()
