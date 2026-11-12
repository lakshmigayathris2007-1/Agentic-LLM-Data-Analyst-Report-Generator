import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from backend.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class ChatAgent:
    """
    ChatAgent: Responsibilities:
    1. Translate natural language user query into executable pandas python code.
    2. Safely execute code against dataset DataFrame in isolated namespace.
    3. Capture text answer (`result`) and optional dynamic chart (`fig` / `chart_json`).
    """
    def execute(self, filepath: str, query: str) -> Dict[str, Any]:
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

        dtypes = {col: str(df[col].dtype) for col in df.columns}
        sample_head = df.head(3).to_dict(orient="records")

        # 1. Generate Pandas Python Code via LLM or rule parser
        code_str = llm_service.generate_chat_pandas_code(
            query=query,
            columns=list(df.columns),
            dtypes=dtypes,
            sample_head=sample_head
        )

        # 2. Execute Code safely in scoped dictionary
        local_scope = {"df": df, "pd": pd, "np": np}
        agent_response = ""
        chart_json = None

        try:
            exec(code_str, {}, local_scope)
            if "result" in local_scope:
                agent_response = str(local_scope["result"])
            else:
                agent_response = f"Query executed successfully on dataset ({len(df)} records)."

            if "fig" in local_scope:
                try:
                    import plotly.io as pio
                    chart_json = pio.to_json(local_scope["fig"])
                except Exception as ex:
                    logger.warning(f"Could not convert plot to JSON: {ex}")

        except Exception as e:
            logger.error(f"Error executing ChatAgent pandas code: {e}")
            agent_response = f"Could not execute query '{query}'. Error: {str(e)}"

        return {
            "query": query,
            "agent_response": agent_response,
            "generated_code": code_str,
            "chart_json": chart_json
        }

chat_agent = ChatAgent()
