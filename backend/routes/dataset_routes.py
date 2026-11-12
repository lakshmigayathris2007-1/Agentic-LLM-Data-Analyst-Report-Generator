import os
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.config import UPLOAD_DIR
from backend.database.connection import get_db
from backend.models.schemas import CleaningOptions
from backend.services import db_service
from backend.services.sample_dataset_service import generate_sample_datasets
from backend.agents.ingestion_agent import ingestion_agent
from backend.agents.cleaning_agent import cleaning_agent
from backend.agents.profiling_agent import profiling_agent

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

class SampleLoadRequest(BaseModel):
    sample_key: str  # 'ecommerce', 'hr', 'healthcare', 'financial'

@router.post("/load-sample")
def load_sample_dataset(req: SampleLoadRequest, db: Session = Depends(get_db)):
    samples = generate_sample_datasets()
    key = req.sample_key.lower()
    if key not in samples:
        raise HTTPException(status_code=400, detail=f"Invalid sample key '{key}'. Must be one of: {list(samples.keys())}")

    src_path = samples[key]
    filename = os.path.basename(src_path)

    # Copy to uploads directory with unique ID
    unique_filename = f"sample_{uuid.uuid4().hex[:6]}_{filename}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(src_path, "rb") as f_src:
        with open(filepath, "wb") as f_dst:
            f_dst.write(f_src.read())

    ingest_data = ingestion_agent.execute(filepath)
    dataset = db_service.create_dataset_record(
        db=db,
        filename=filename,
        filepath=filepath,
        file_type=ingest_data["file_type"],
        file_size_bytes=ingest_data["file_size_bytes"],
        row_count=ingest_data["row_count"],
        col_count=ingest_data["column_count"]
    )

    profile_res = profiling_agent.execute(filepath)
    db_service.save_data_profile(
        db=db,
        dataset_id=dataset.id,
        column_details=profile_res["column_details"],
        missing_summary=profile_res["missing_value_summary"],
        duplicate_rows=profile_res["duplicate_rows"],
        quality_score=profile_res["quality_score"],
        summary_stats=profile_res["summary_stats"]
    )

    return {
        "message": f"Sample dataset '{filename}' loaded successfully.",
        "dataset_id": dataset.id,
        "filename": dataset.filename,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "quality_score": profile_res["quality_score"]
    }

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Step 1: Dataset Upload Endpoint (CSV, Excel, JSON).
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.csv', '.xlsx', '.xls', '.json']:
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV, XLSX, XLS, and JSON files are supported.")

    unique_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)

    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    try:
        ingest_data = ingestion_agent.execute(filepath)
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=400, detail=f"File parsing error: {str(e)}")

    dataset = db_service.create_dataset_record(
        db=db,
        filename=file.filename,
        filepath=filepath,
        file_type=ingest_data["file_type"],
        file_size_bytes=ingest_data["file_size_bytes"],
        row_count=ingest_data["row_count"],
        col_count=ingest_data["column_count"]
    )

    # Automatically trigger initial Profiling
    profile_res = profiling_agent.execute(filepath)
    db_service.save_data_profile(
        db=db,
        dataset_id=dataset.id,
        column_details=profile_res["column_details"],
        missing_summary=profile_res["missing_value_summary"],
        duplicate_rows=profile_res["duplicate_rows"],
        quality_score=profile_res["quality_score"],
        summary_stats=profile_res["summary_stats"]
    )

    return {
        "message": "Dataset uploaded and profiled successfully.",
        "dataset_id": dataset.id,
        "filename": dataset.filename,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "file_type": dataset.file_type,
        "quality_score": profile_res["quality_score"]
    }

@router.get("/")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db_service.get_all_datasets(db)
    return datasets

@router.get("/{dataset_id}")
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db_service.get_dataset_by_id(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    profile = db_service.get_data_profile(db, dataset_id)
    return {
        "dataset": dataset,
        "profile": profile
    }

@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: str, limit: int = 50, db: Session = Depends(get_db)):
    dataset = db_service.get_dataset_by_id(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    target_path = dataset.cleaned_filepath or dataset.filepath
    ext = target_path.split('.')[-1].lower()

    try:
        if ext == 'csv':
            try:
                df = pd.read_csv(target_path)
            except UnicodeDecodeError:
                df = pd.read_csv(target_path, encoding='latin-1')
        elif ext in ['xlsx', 'xls']:
            df = pd.read_excel(target_path)
        else:
            df = pd.read_json(target_path)
        
        df = df.where(pd.notnull(df), None)
        return {
            "columns": list(df.columns),
            "rows": df.head(limit).to_dict(orient="records"),
            "total_rows": len(df),
            "is_cleaned": bool(dataset.cleaned_filepath)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed reading preview: {str(e)}")

@router.post("/{dataset_id}/clean")
def clean_dataset(dataset_id: str, options: CleaningOptions, db: Session = Depends(get_db)):
    dataset = db_service.get_dataset_by_id(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    clean_res = cleaning_agent.execute(
        filepath=dataset.filepath,
        clean_options=options.model_dump()
    )

    db_service.update_dataset_status(
        db=db,
        dataset_id=dataset_id,
        status="cleaned",
        cleaned_filepath=clean_res["cleaned_filepath"]
    )

    db_service.save_cleaning_log(
        db=db,
        dataset_id=dataset_id,
        actions=clean_res["actions_taken"],
        rows_before=clean_res["rows_before"],
        rows_after=clean_res["rows_after"],
        cols_before=clean_res["columns_before"],
        cols_after=clean_res["columns_after"]
    )

    # Re-profile cleaned dataset
    profile_res = profiling_agent.execute(clean_res["cleaned_filepath"])
    db_service.save_data_profile(
        db=db,
        dataset_id=dataset_id,
        column_details=profile_res["column_details"],
        missing_summary=profile_res["missing_value_summary"],
        duplicate_rows=profile_res["duplicate_rows"],
        quality_score=profile_res["quality_score"],
        summary_stats=profile_res["summary_stats"]
    )

    return {
        "message": "Dataset cleaned successfully.",
        "actions_taken": clean_res["actions_taken"],
        "rows_before": clean_res["rows_before"],
        "rows_after": clean_res["rows_after"],
        "new_quality_score": profile_res["quality_score"]
    }
