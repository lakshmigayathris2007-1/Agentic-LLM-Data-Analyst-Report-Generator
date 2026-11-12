-- =========================================================
-- Agentic LLM for Autonomous Data Analysis and Report Generation
-- MySQL & SQLite Database Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(512) NOT NULL,
    cleaned_filepath VARCHAR(512),
    file_type VARCHAR(20) NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    row_count INT DEFAULT 0,
    column_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'uploaded',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_profiles (
    id VARCHAR(64) PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    column_details JSON,
    missing_value_summary JSON,
    duplicate_rows INT DEFAULT 0,
    quality_score FLOAT DEFAULT 0.0,
    summary_stats JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cleaning_logs (
    id VARCHAR(64) PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    actions_taken JSON,
    rows_before INT,
    rows_after INT,
    columns_before INT,
    columns_after INT,
    cleaned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_results (
    id VARCHAR(64) PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    domain_category VARCHAR(100),
    kpis JSON,
    correlations JSON,
    group_aggregations JSON,
    plotly_specs JSON,
    top_insights JSON,
    recommendations JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    pdf_path VARCHAR(512),
    docx_path VARCHAR(512),
    summary JSON,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_history (
    id VARCHAR(64) PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    user_query TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    generated_code TEXT,
    chart_json JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);
