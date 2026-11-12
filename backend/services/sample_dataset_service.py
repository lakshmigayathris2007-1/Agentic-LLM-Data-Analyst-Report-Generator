import os
import pandas as pd
import numpy as np
from backend.config import BASE_DIR, UPLOAD_DIR

SAMPLE_DIR = BASE_DIR / "sample_datasets"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

def generate_sample_datasets():
    np.random.seed(42)

    # 1. E-Commerce Sales Dataset
    ecommerce_path = os.path.join(SAMPLE_DIR, "ecommerce_sales_2026.csv")
    if not os.path.exists(ecommerce_path):
        categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty"]
        regions = ["North America", "Europe", "Asia-Pacific", "Latin America"]
        segments = ["Consumer", "Corporate", "Home Office"]
        
        n_records = 150
        data = {
            "Order_ID": [f"ORD-{1000 + i}" for i in range(n_records)],
            "Category": np.random.choice(categories, n_records),
            "Region": np.random.choice(regions, n_records),
            "Customer_Segment": np.random.choice(segments, n_records),
            "Sales_Revenue": np.round(np.random.uniform(20.0, 1500.0, n_records), 2),
            "Profit": np.round(np.random.uniform(-50.0, 400.0, n_records), 2),
            "Discount_Pct": np.round(np.random.uniform(0.0, 0.35, n_records), 2),
            "Quantity_Ordered": np.random.randint(1, 15, n_records),
            "Delivery_Days": np.random.randint(1, 10, n_records),
            "Customer_Rating": np.round(np.random.uniform(2.5, 5.0, n_records), 1)
        }
        # Inject minor missing values for cleaning demonstration
        data["Profit"][12] = None
        data["Customer_Rating"][25] = None
        df_ecom = pd.DataFrame(data)
        df_ecom.to_csv(ecommerce_path, index=False)

    # 2. HR Employee Analytics Dataset
    hr_path = os.path.join(SAMPLE_DIR, "hr_employee_analytics.csv")
    if not os.path.exists(hr_path):
        depts = ["Engineering", "Sales", "Marketing", "Human Resources", "Finance", "Product"]
        roles = ["Software Engineer", "Account Executive", "Marketing Specialist", "HR Generalist", "Financial Analyst", "Product Manager"]
        n_records = 120
        data = {
            "Employee_ID": [f"EMP-{500 + i}" for i in range(n_records)],
            "Department": np.random.choice(depts, n_records),
            "Job_Role": np.random.choice(roles, n_records),
            "Age": np.random.randint(22, 60, n_records),
            "Monthly_Salary": np.round(np.random.uniform(4000, 18000, n_records), 2),
            "Years_At_Company": np.random.randint(1, 15, n_records),
            "Performance_Rating": np.random.randint(1, 6, n_records),
            "Attrition": np.random.choice(["Yes", "No"], n_records, p=[0.18, 0.82]),
            "Overtime_Hours": np.random.randint(0, 30, n_records)
        }
        data["Monthly_Salary"][8] = None
        df_hr = pd.DataFrame(data)
        df_hr.to_csv(hr_path, index=False)

    # 3. Healthcare Patients Dataset
    health_path = os.path.join(SAMPLE_DIR, "healthcare_patients.csv")
    if not os.path.exists(health_path):
        diagnoses = ["Hypertension", "Diabetes", "Cardiovascular", "Asthma", "General Checkup"]
        n_records = 130
        data = {
            "Patient_ID": [f"PAT-{200 + i}" for i in range(n_records)],
            "Age": np.random.randint(18, 85, n_records),
            "Gender": np.random.choice(["Male", "Female"], n_records),
            "Diagnosis": np.random.choice(diagnoses, n_records),
            "Blood_Pressure_Systolic": np.random.randint(100, 170, n_records),
            "BMI": np.round(np.random.uniform(18.5, 38.0, n_records), 1),
            "Treatment_Cost": np.round(np.random.uniform(500, 12000, n_records), 2),
            "Readmitted": np.random.choice(["Yes", "No"], n_records, p=[0.22, 0.78]),
            "Hospital_Stay_Days": np.random.randint(1, 14, n_records)
        }
        data["BMI"][15] = None
        df_health = pd.DataFrame(data)
        df_health.to_csv(health_path, index=False)

    # 4. Financial Transactions Dataset
    fin_path = os.path.join(SAMPLE_DIR, "financial_transactions.csv")
    if not os.path.exists(fin_path):
        acc_types = ["Savings", "Checking", "Investment", "Credit"]
        n_records = 140
        data = {
            "Transaction_ID": [f"TXN-{8000 + i}" for i in range(n_records)],
            "Account_Type": np.random.choice(acc_types, n_records),
            "Transaction_Amount": np.round(np.random.uniform(10.0, 5000.0, n_records), 2),
            "Risk_Score": np.round(np.random.uniform(0.01, 0.99, n_records), 2),
            "Is_Fraud": np.random.choice([0, 1], n_records, p=[0.94, 0.06]),
            "Balance_Before": np.round(np.random.uniform(100.0, 50000.0, n_records), 2),
            "Customer_Credit_Score": np.random.randint(580, 850, n_records)
        }
        df_fin = pd.DataFrame(data)
        df_fin.to_csv(fin_path, index=False)

    return {
        "ecommerce": ecommerce_path,
        "hr": hr_path,
        "healthcare": health_path,
        "financial": fin_path
    }

generate_sample_datasets()
