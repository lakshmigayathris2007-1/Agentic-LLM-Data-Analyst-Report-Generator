from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.schemas import ChatQueryRequest, ChatQueryResponse
from backend.services import db_service
from backend.agents.chat_agent import chat_agent

router = APIRouter(prefix="/api/chat", tags=["Chat With Data"])

@router.post("/query", response_model=ChatQueryResponse)
def query_chat_agent(request: ChatQueryRequest, db: Session = Depends(get_db)):
    """
    Step 8: Chat With Data Endpoint.
    Natural language querying using LLM + Pandas execution chain.
    """
    dataset = db_service.get_dataset_by_id(db, request.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    target_path = dataset.cleaned_filepath or dataset.filepath

    res = chat_agent.execute(filepath=target_path, query=request.query)

    # Record message in database
    db_service.save_chat_message(
        db=db,
        dataset_id=dataset.id,
        query=request.query,
        response=res["agent_response"],
        code=res["generated_code"],
        chart_json=res["chart_json"]
    )

    return ChatQueryResponse(
        user_query=res["query"],
        agent_response=res["agent_response"],
        generated_code=res["generated_code"],
        chart_json=res["chart_json"]
    )

@router.get("/history/{dataset_id}")
def get_chat_history(dataset_id: str, db: Session = Depends(get_db)):
    history = db_service.get_chat_history(db, dataset_id)
    return history
