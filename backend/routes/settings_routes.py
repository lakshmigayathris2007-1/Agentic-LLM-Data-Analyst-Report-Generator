from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.services.llm_service import llm_service

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class LLMSettingsRequest(BaseModel):
    provider: str  # 'openai', 'gemini', 'ollama', 'fallback'
    model: str     # 'gpt-4o', 'gemini-1.5-flash', 'llama3', etc.
    api_key: Optional[str] = ""
    gemini_key: Optional[str] = ""
    temperature: Optional[float] = 0.2

@router.get("/llm")
def get_llm_settings():
    return llm_service.get_config()

@router.post("/llm")
def update_llm_settings(req: LLMSettingsRequest):
    llm_service.set_config(
        provider=req.provider,
        model=req.model,
        api_key=req.api_key or "",
        temperature=req.temperature or 0.2,
        gemini_key=req.gemini_key or ""
    )
    return {
        "message": "LLM settings updated successfully.",
        "config": llm_service.get_config()
    }

@router.post("/llm/test")
def test_llm_connection():
    res = llm_service.test_connection()
    if not res.get("success"):
        return {
            "status": "error",
            "message": f"Connection test failed for {res.get('provider')}: {res.get('error')}",
            "details": res
        }
    return {
        "status": "success",
        "message": f"Successfully connected to {res.get('provider')} ({res.get('model')}) in {res.get('latency_ms')}ms.",
        "details": res
    }
