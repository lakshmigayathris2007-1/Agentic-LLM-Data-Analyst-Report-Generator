import os
import uuid
import logging
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List
from backend.config import CHART_DIR
from backend.utils.json_utils import make_json_safe

logger = logging.getLogger(__name__)

class VisualizationAgent:
    """
    VisualizationAgent: Responsibilities:
    1. Automatically select best chart types (Bar, Pie, Line, Histogram, Correlation Heatmap, Scatter).
    2. Render high-resolution PNG charts saved to `charts/` for PDF/DOCX embedding.
    3. Generate Plotly JSON chart specifications for dynamic frontend rendering.
    """
    def execute(self, filepath: str, dataset_id: str) -> Dict[str, Any]:
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

        numeric_cols = list(df.select_dtypes(include=[np.number]).columns)
        cat_cols = list(df.select_dtypes(include=['object', 'category', 'string']).columns)

        chart_image_paths = []
        plotly_specs = []

        # Color Palette
        sns.set_theme(style="whitegrid")
        palette = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

        # 1. Bar Chart: Categorical vs Numeric or Top Counts
        if cat_cols and numeric_cols:
            try:
                plt.figure(figsize=(8, 4.5))
                cat_col = cat_cols[0]
                num_col = numeric_cols[0]

                top_grp = df.groupby(cat_col)[num_col].sum().nlargest(8).reset_index()
                sns.barplot(data=top_grp, x=cat_col, y=num_col, hue=cat_col, legend=False, palette="Blues_r")
                plt.title(f"Top {cat_col} by {num_col}", fontsize=12, fontweight='bold', pad=12)
                plt.xlabel(str(cat_col), fontsize=10)
                plt.ylabel(str(num_col), fontsize=10)
                plt.xticks(rotation=30, ha='right')
                plt.tight_layout()

                chart_name = f"chart_{dataset_id}_bar.png"
                chart_path = os.path.join(CHART_DIR, chart_name)
                plt.savefig(chart_path, dpi=200)
                plt.close()
                chart_image_paths.append(chart_path)

                plotly_specs.append({
                    "type": "bar",
                    "title": f"Top {cat_col} by {num_col}",
                    "data": [{
                        "x": top_grp[cat_col].astype(str).tolist(),
                        "y": top_grp[num_col].tolist(),
                        "type": "bar",
                        "marker": {"color": "#2563EB"}
                    }],
                    "layout": {"xaxis": {"title": str(cat_col)}, "yaxis": {"title": str(num_col)}}
                })
            except Exception as e:
                logger.warning(f"Could not render Bar Chart: {e}")
                plt.close('all')

        # 2. Histogram / Distribution Chart for Numeric Attribute
        if numeric_cols:
            try:
                plt.figure(figsize=(8, 4.5))
                num_col = numeric_cols[0]
                clean_num = df[num_col].dropna()

                if not clean_num.empty:
                    sns.histplot(clean_num, kde=True, color="#0EA5E9", bins=20)
                    plt.title(f"Distribution of {num_col}", fontsize=12, fontweight='bold', pad=12)
                    plt.xlabel(str(num_col), fontsize=10)
                    plt.ylabel("Frequency", fontsize=10)
                    plt.tight_layout()

                    chart_name = f"chart_{dataset_id}_hist.png"
                    chart_path = os.path.join(CHART_DIR, chart_name)
                    plt.savefig(chart_path, dpi=200)
                    plt.close()
                    chart_image_paths.append(chart_path)

                    plotly_specs.append({
                        "type": "histogram",
                        "title": f"Distribution of {num_col}",
                        "data": [{
                            "x": clean_num.tolist(),
                            "type": "histogram",
                            "marker": {"color": "#0EA5E9"}
                        }],
                        "layout": {"xaxis": {"title": str(num_col)}, "yaxis": {"title": "Frequency"}}
                    })
            except Exception as e:
                logger.warning(f"Could not render Histogram: {e}")
                plt.close('all')

        # 3. Pie Chart: Categorical Distribution
        if cat_cols:
            try:
                plt.figure(figsize=(7, 4.5))
                cat_col = cat_cols[0]
                val_counts = df[cat_col].astype(str).value_counts().head(6)

                if not val_counts.empty:
                    plt.pie(val_counts.values, labels=val_counts.index, autopct='%1.1f%%', colors=palette[:len(val_counts)], startangle=140)
                    plt.title(f"Composition of {cat_col}", fontsize=12, fontweight='bold')
                    plt.tight_layout()

                    chart_name = f"chart_{dataset_id}_pie.png"
                    chart_path = os.path.join(CHART_DIR, chart_name)
                    plt.savefig(chart_path, dpi=200)
                    plt.close()
                    chart_image_paths.append(chart_path)

                    plotly_specs.append({
                        "type": "pie",
                        "title": f"Composition of {cat_col}",
                        "data": [{
                            "labels": val_counts.index.tolist(),
                            "values": val_counts.values.tolist(),
                            "type": "pie"
                        }],
                        "layout": {}
                    })
            except Exception as e:
                logger.warning(f"Could not render Pie Chart: {e}")
                plt.close('all')

        # 4. Correlation Heatmap for Numeric Variables
        if len(numeric_cols) >= 2:
            try:
                plt.figure(figsize=(7.5, 5))
                corr = df[numeric_cols[:7]].corr().fillna(0)

                sns.heatmap(corr, annot=True, fmt=".2f", cmap="Blues", cbar=True, square=True)
                plt.title("Correlation Heatmap", fontsize=12, fontweight='bold', pad=12)
                plt.tight_layout()

                chart_name = f"chart_{dataset_id}_heatmap.png"
                chart_path = os.path.join(CHART_DIR, chart_name)
                plt.savefig(chart_path, dpi=200)
                plt.close()
                chart_image_paths.append(chart_path)

                plotly_specs.append({
                    "type": "heatmap",
                    "title": "Correlation Heatmap",
                    "data": [{
                        "z": corr.values.tolist(),
                        "x": [str(c) for c in corr.columns],
                        "y": [str(c) for c in corr.index],
                        "type": "heatmap",
                        "colorscale": "Viridis"
                    }],
                    "layout": {}
                })
            except Exception as e:
                logger.warning(f"Could not render Correlation Heatmap: {e}")
                plt.close('all')

        # 5. Scatter Plot: Numeric vs Numeric
        if len(numeric_cols) >= 2:
            try:
                plt.figure(figsize=(8, 4.5))
                col_x = numeric_cols[0]
                col_y = numeric_cols[1]

                sns.scatterplot(data=df, x=col_x, y=col_y, color="#8B5CF6", alpha=0.7)
                plt.title(f"{col_y} vs {col_x}", fontsize=12, fontweight='bold', pad=12)
                plt.xlabel(str(col_x), fontsize=10)
                plt.ylabel(str(col_y), fontsize=10)
                plt.tight_layout()

                chart_name = f"chart_{dataset_id}_scatter.png"
                chart_path = os.path.join(CHART_DIR, chart_name)
                plt.savefig(chart_path, dpi=200)
                plt.close()
                chart_image_paths.append(chart_path)

                plotly_specs.append({
                    "type": "scatter",
                    "title": f"{col_y} vs {col_x}",
                    "data": [{
                        "x": df[col_x].dropna().tolist(),
                        "y": df[col_y].dropna().tolist(),
                        "mode": "markers",
                        "type": "scatter",
                        "marker": {"color": "#8B5CF6"}
                    }],
                    "layout": {"xaxis": {"title": str(col_x)}, "yaxis": {"title": str(col_y)}}
                })
            except Exception as e:
                logger.warning(f"Could not render Scatter Plot: {e}")
                plt.close('all')

        return {
            "chart_image_paths": chart_image_paths,
            "plotly_specs": make_json_safe(plotly_specs)
        }

visualization_agent = VisualizationAgent()
