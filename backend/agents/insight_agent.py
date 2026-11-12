import logging
from typing import Dict, Any, List
from backend.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class InsightAgent:
    """
    InsightAgent: Responsibilities:
    1. Interpret numerical analytics, domain category, quality score, and KPI metrics.
    2. Generate business insights, key trends, anomaly callouts, and recommendations.
    """
    def execute(self, domain_category: str, summary_stats: Dict[str, Any], kpis: Dict[str, Any], quality_score: float) -> Dict[str, List[str]]:
        result = llm_service.generate_insights_and_recommendations(
            domain=domain_category,
            summary_stats=summary_stats,
            kpis=kpis,
            quality_score=quality_score
        )
        return {
            "insights": result.get("top_insights", []),
            "recommendations": result.get("recommendations", [])
        }

insight_agent = InsightAgent()
