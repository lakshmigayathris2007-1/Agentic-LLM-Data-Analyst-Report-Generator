import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.config import REPORT_DIR
from backend.database.connection import get_db
from backend.services import db_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{dataset_id}")
def get_reports_for_dataset(dataset_id: str, db: Session = Depends(get_db)):
    reports = db_service.get_reports_by_dataset(db, dataset_id)
    return reports

@router.get("/download/{filename}")
def download_report(filename: str):
    file_path = os.path.join(REPORT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Report file '{filename}' not found.")

    ext = filename.split('.')[-1].lower()
    media_type = "application/pdf" if ext == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )
