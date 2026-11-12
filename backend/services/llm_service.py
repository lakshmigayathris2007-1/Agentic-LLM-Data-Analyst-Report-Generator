import os
import json
import logging
import time
import requests
from typing import Dict, Any, List, Optional
from backend.config import OPENAI_API_KEY, OPENAI_MODEL

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        raw_openai_key = os.getenv("LLM_API_KEY", OPENAI_API_KEY or "")
        raw_gemini_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
        
        self.api_key = raw_openai_key if raw_openai_key and not raw_openai_key.lower().startswith("your_") else ""
        self.gemini_key = raw_gemini_key if raw_gemini_key and not raw_gemini_key.lower().startswith("your_") else ""
        
        env_provider = os.getenv("LLM_PROVIDER", "").lower()
        if env_provider:
            self.provider = env_provider
        elif self.api_key:
            self.provider = "openai"
        elif self.gemini_key:
            self.provider = "gemini"
        else:
            self.provider = "fallback"

        self.model = os.getenv("LLM_MODEL", OPENAI_MODEL or "gpt-4o")
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.2"))
        self._init_llm_client()

    def set_config(self, provider: str, model: str, api_key: str = "", temperature: float = 0.2, gemini_key: str = ""):
        self.provider = provider.lower()
        self.model = model
        if api_key and not api_key.lower().startswith("your_"):
            self.api_key = api_key
        if gemini_key and not gemini_key.lower().startswith("your_"):
            self.gemini_key = gemini_key
        self.temperature = temperature
        self._init_llm_client()
        logger.info(f"Updated LLM configuration: provider={self.provider}, model={self.model}")

    def get_config(self) -> Dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.model,
            "has_openai_key": bool(self.api_key and len(self.api_key) > 5),
            "has_gemini_key": bool(self.gemini_key and len(self.gemini_key) > 5),
            "temperature": self.temperature,
            "status": "ready" if self.provider == "fallback" or (self.provider == "openai" and self.api_key) or (self.provider == "gemini" and (self.gemini_key or self.api_key)) or self.provider == "ollama" else "unconfigured"
        }

    def _init_llm_client(self):
        self.llm = None
        if self.provider == "openai" and self.api_key:
            try:
                from langchain_openai import ChatOpenAI
                self.llm = ChatOpenAI(
                    model=self.model,
                    openai_api_key=self.api_key,
                    temperature=self.temperature,
                    request_timeout=15
                )
                logger.info(f"Initialized OpenAI LLM service with model {self.model}")
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI LLM: {e}. Falling back to rule-based engine.")
                self.provider = "fallback"

    def test_connection(self) -> Dict[str, Any]:
        start = time.time()
        try:
            res = self._call_llm_raw("Say 'LLM Connected' in exactly two words.")
            latency = round((time.time() - start) * 1000, 2)
            return {
                "success": True,
                "provider": self.provider,
                "model": self.model,
                "latency_ms": latency,
                "response": res
            }
        except Exception as e:
            return {
                "success": False,
                "provider": self.provider,
                "model": self.model,
                "error": str(e)
            }

    def _call_llm_raw(self, prompt: str) -> str:
        # 1. OpenAI LangChain
        if self.provider == "openai" and self.llm:
            resp = self.llm.invoke(prompt)
            return resp.content.strip()

        # 2. Google Gemini REST API or SDK
        elif self.provider == "gemini":
            key = self.gemini_key or self.api_key
            if not key:
                raise ValueError("Gemini API key is missing.")
            
            model_name = self.model if "gemini" in self.model else "gemini-1.5-flash"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": self.temperature}
            }
            res = requests.post(url, headers=headers, json=payload, timeout=15)
            if res.status_code == 200:
                data = res.json()
                try:
                    return data['candidates'][0]['content']['parts'][0]['text'].strip()
                except Exception:
                    raise ValueError(f"Unexpected Gemini API response structure: {data}")
            else:
                raise ValueError(f"Gemini API returned HTTP {res.status_code}: {res.text}")

        # 3. Ollama Local LLM
        elif self.provider == "ollama":
            url = "http://localhost:11434/api/generate"
            payload = {
                "model": self.model or "llama3",
                "prompt": prompt,
                "stream": False
            }
            res = requests.post(url, json=payload, timeout=15)
            if res.status_code == 200:
                return res.json().get("response", "").strip()
            else:
                raise ValueError(f"Ollama returned HTTP {res.status_code}: {res.text}")

        # Fallback Engine signal
        raise NotImplementedError("Fallback Engine requested")

    def classify_domain(self, columns: List[str], sample_data: Dict[str, Any]) -> str:
        if self.provider != "fallback":
            try:
                prompt = (
                    f"Analyze the following column names and sample data of a dataset:\n"
                    f"Columns: {columns}\n"
                    f"Sample Data: {json.dumps(sample_data, default=str)}\n\n"
                    f"Classify the dataset domain category into EXACTLY ONE of the following string options:\n"
                    f"['Sales', 'HR', 'Finance', 'Marketing', 'Healthcare', 'Education', 'E-Commerce', 'Operations', 'General']\n"
                    f"Return ONLY the single category string name."
                )
                category = self._call_llm_raw(prompt).replace("'", "").replace('"', '')
                valid_categories = ['Sales', 'HR', 'Finance', 'Marketing', 'Healthcare', 'Education', 'E-Commerce', 'Operations', 'General']
                for valid in valid_categories:
                    if valid.lower() in category.lower():
                        return valid
            except Exception as e:
                logger.warning(f"LLM domain classification failed ({e}). Using rule fallback.")

        # Heuristic Rule Fallback
        cols_lower = [c.lower() for c in columns]
        if any(k in cols_lower for k in ['attrition', 'department', 'salary', 'employee', 'hire_date', 'job_title']):
            return 'HR'
        if any(k in cols_lower for k in ['sales', 'revenue', 'profit', 'product', 'quantity', 'order', 'discount']):
            return 'Sales'
        if any(k in cols_lower for k in ['patient', 'diagnosis', 'doctor', 'hospital', 'blood_pressure', 'age']):
            return 'Healthcare'
        if any(k in cols_lower for k in ['student', 'grade', 'score', 'course', 'exam', 'teacher']):
            return 'Education'
        if any(k in cols_lower for k in ['campaign', 'clicks', 'conversions', 'impressions', 'roi', 'leads']):
            return 'Marketing'
        if any(k in cols_lower for k in ['balance', 'credit', 'debit', 'transaction', 'portfolio', 'account', 'risk_score']):
            return 'Finance'
        return 'General'

    def generate_insights_and_recommendations(self, domain: str, summary_stats: Dict[str, Any], kpis: Dict[str, Any], quality_score: float) -> Dict[str, List[str]]:
        if self.provider != "fallback":
            try:
                prompt = (
                    f"You are a Senior Data Analyst and Business Consultant.\n"
                    f"Dataset Domain: {domain}\n"
                    f"Data Quality Score: {quality_score}/100\n"
                    f"Key KPIs: {json.dumps(kpis, default=str)}\n"
                    f"Summary Statistics: {json.dumps(summary_stats, default=str)}\n\n"
                    f"Generate a JSON object with two keys:\n"
                    f"1. 'top_insights': A list of 4 key analytical insights, trends, and anomalies.\n"
                    f"2. 'recommendations': A list of 4 strategic, actionable business recommendations.\n"
                    f"Format the output strictly as valid JSON without markdown wrapping."
                )
                raw_res = self._call_llm_raw(prompt)
                clean_str = raw_res.strip()
                if "```json" in clean_str:
                    clean_str = clean_str.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_str:
                    clean_str = clean_str.split("```")[1].split("```")[0].strip()
                parsed = json.loads(clean_str)
                if "top_insights" in parsed and "recommendations" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"LLM insight generation failed ({e}). Using deterministic fallback engine.")

        # Deterministic Rule Fallback Engine
        insights = [
            f"The dataset is classified under the {domain} domain with an automated Data Health Quality score of {quality_score:.1f}/100.",
            f"Structured dataset contains {summary_stats.get('shape', [0, 0])[0]:,} records across {summary_stats.get('shape', [0, 0])[1]} attribute dimensions."
        ]

        if kpis:
            kpi_desc = ", ".join([f"{k}: {v}" for k, v in list(kpis.items())[:3]])
            insights.append(f"Primary calculated domain metrics include: {kpi_desc}.")
        else:
            insights.append("Statistical distributions indicate active feature variance across quantitative attributes.")

        if quality_score >= 85:
            insights.append("Data integrity is exceptionally robust with minimal missing entries or structural duplicates.")
        else:
            insights.append("Identified data hygiene opportunities in missing values or outlier distributions prior to downstream modeling.")

        recommendations = [
            f"Implement automated monitoring pipelines for key {domain} metrics to detect operational variance early.",
            "Establish standard operational data validation rules at ingestion to elevate overall data quality.",
            "Prioritize top-performing attribute segments identified in group aggregations for strategic resource allocation.",
            "Schedule periodic automated report runs to share cross-departmental executive summaries."
        ]

        return {
            "top_insights": insights,
            "recommendations": recommendations
        }

    def generate_chat_pandas_code(self, query: str, columns: List[str], dtypes: Dict[str, str], sample_head: Dict[str, Any]) -> str:
        if self.provider != "fallback":
            try:
                prompt = (
                    f"You are a Python Data Science Assistant. Write executable Python code using pandas to answer the user query on a DataFrame named `df`.\n"
                    f"Available Columns and Types: {json.dumps(dtypes, default=str)}\n"
                    f"Sample Rows: {json.dumps(sample_head, default=str)}\n"
                    f"User Query: {query}\n\n"
                    f"Rules:\n"
                    f"1. Store the final textual answer or summary string in a variable named `result`.\n"
                    f"2. Optionally, if a plot is helpful, create a Plotly figure and store it in `fig`.\n"
                    f"3. Return ONLY valid Python code inside triple backticks ```python ... ```."
                )
                raw_code = self._call_llm_raw(prompt)
                code_str = raw_code.strip()
                if "```python" in code_str:
                    code_str = code_str.split("```python")[1].split("```")[0].strip()
                elif "```" in code_str:
                    code_str = code_str.split("```")[1].split("```")[0].strip()
                return code_str
            except Exception as e:
                logger.warning(f"LLM code generation failed ({e}). Falling back to dynamic query engine.")

        # Fallback Query Parser
        q_lower = query.lower()
        cols_lower_map = {c.lower(): c for c in columns}
        num_cols = [c for c, d in dtypes.items() if any(t in d.lower() for t in ["int", "float", "number"])]
        cat_cols = [c for c, d in dtypes.items() if any(t in d.lower() for t in ["object", "category", "string", "bool"])]

        target_col = None
        for col_name, actual_col in cols_lower_map.items():
            if col_name in q_lower:
                target_col = actual_col
                break

        if any(w in q_lower for w in ["total", "sum", "overall amount"]):
            col = target_col if target_col and target_col in num_cols else (num_cols[0] if num_cols else None)
            if col:
                return f"val = df['{col}'].sum()\nresult = f'Total sum of {col}: {{val:,.2f}}'"

        if any(w in q_lower for w in ["avg", "average", "mean"]):
            col = target_col if target_col and target_col in num_cols else (num_cols[0] if num_cols else None)
            if col:
                return f"val = df['{col}'].mean()\nresult = f'Average {col}: {{val:,.2f}}'"

        if any(w in q_lower for w in ["max", "maximum", "highest", "largest", "top value"]):
            col = target_col if target_col and target_col in num_cols else (num_cols[0] if num_cols else None)
            if col:
                return f"val = df['{col}'].max()\nresult = f'Maximum value of {col}: {{val:,.2f}}'"

        if any(w in q_lower for w in ["min", "minimum", "lowest", "smallest"]):
            col = target_col if target_col and target_col in num_cols else (num_cols[0] if num_cols else None)
            if col:
                return f"val = df['{col}'].min()\nresult = f'Minimum value of {col}: {{val:,.2f}}'"

        if any(w in q_lower for w in ["column", "schema", "attribute", "feature", "field"]):
            cols_fmt = "\\n".join([f"- {c} ({dtypes.get(c, 'unknown')})" for c in columns])
            return f"result = 'Dataset Columns & Data Types:\\n{cols_fmt}'"

        if any(w in q_lower for w in ["missing", "null", "empty", "nan", "health"]):
            return "null_summary = df.isnull().sum()\nnull_summary = null_summary[null_summary > 0]\nif null_summary.empty:\n    result = 'Great news! No missing values were found in this dataset.'\nelse:\n    result = f'Missing Values Summary:\\n{null_summary.to_string()}'"

        if any(w in q_lower for w in ["unique", "categories", "distinct", "value count"]):
            col = target_col if target_col else (cat_cols[0] if cat_cols else columns[0])
            return f"vc = df['{col}'].value_counts().head(10)\nresult = f'Top categories in {col}:\\n{{vc.to_string()}}'"

        if any(w in q_lower for w in ["top", "group", "breakdown", "highest department", "highest product"]):
            c_col = target_col if target_col in cat_cols else (cat_cols[0] if cat_cols else None)
            n_col = num_cols[0] if num_cols else None
            if c_col and n_col:
                return f"top_grp = df.groupby('{c_col}')['{n_col}'].sum().nlargest(5).reset_index()\nresult = f'Top 5 {c_col} by sum of {n_col}:\\n' + top_grp.to_string(index=False)"
            elif c_col:
                return f"top_cnt = df['{c_col}'].value_counts().head(5).reset_index()\nresult = f'Top 5 {c_col} by record count:\\n' + top_cnt.to_string(index=False)"

        if any(w in q_lower for w in ["row", "count", "record", "length", "size", "how many"]):
            return "result = f'Dataset Dimensions: {len(df):,} total rows across {len(df.columns)} columns.'"

        return "summary = df.describe(include='all').T[['count', 'mean', 'std', 'min', '50%', 'max']].dropna(how='all').head(10)\nresult = f'Dataset Summary Statistics:\\n{summary.to_string()}'"

llm_service = LLMService()
