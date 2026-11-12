import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(64), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(512), nullable=False)
    cleaned_filepath = Column(String(512), nullable=True)
    file_type = Column(String(20), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    status = Column(String(50), default="uploaded")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    profiles = relationship("DataProfile", back_populates="dataset", cascade="all, delete-orphan")
    cleaning_logs = relationship("CleaningLog", back_populates="dataset", cascade="all, delete-orphan")
    analysis_results = relationship("AnalysisResult", back_populates="dataset", cascade="all, delete-orphan")
    reports = relationship("ReportRecord", back_populates="dataset", cascade="all, delete-orphan")
    chat_history = relationship("ChatMessage", back_populates="dataset", cascade="all, delete-orphan")


class DataProfile(Base):
    __tablename__ = "data_profiles"

    id = Column(String(64), primary_key=True, index=True)
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    column_details = Column(JSON, nullable=True)
    missing_value_summary = Column(JSON, nullable=True)
    duplicate_rows = Column(Integer, default=0)
    quality_score = Column(Float, default=0.0)
    summary_stats = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="profiles")


class CleaningLog(Base):
    __tablename__ = "cleaning_logs"

    id = Column(String(64), primary_key=True, index=True)
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    actions_taken = Column(JSON, nullable=True)
    rows_before = Column(Integer, default=0)
    rows_after = Column(Integer, default=0)
    columns_before = Column(Integer, default=0)
    columns_after = Column(Integer, default=0)
    cleaned_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="cleaning_logs")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(64), primary_key=True, index=True)
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    domain_category = Column(String(100), nullable=True)
    kpis = Column(JSON, nullable=True)
    correlations = Column(JSON, nullable=True)
    group_aggregations = Column(JSON, nullable=True)
    plotly_specs = Column(JSON, nullable=True)
    top_insights = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="analysis_results")


class ReportRecord(Base):
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, index=True)
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    pdf_path = Column(String(512), nullable=True)
    docx_path = Column(String(512), nullable=True)
    summary = Column(JSON, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="reports")


class ChatMessage(Base):
    __tablename__ = "chat_history"

    id = Column(String(64), primary_key=True, index=True)
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    user_query = Column(Text, nullable=False)
    agent_response = Column(Text, nullable=False)
    generated_code = Column(Text, nullable=True)
    chart_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="chat_history")
