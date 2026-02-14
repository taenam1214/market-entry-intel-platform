import json
import logging
import re
from typing import Dict, Any, List
import openai
from django.conf import settings

logger = logging.getLogger(__name__)


class FinancialModelingAgent:
    """Agent for generating sensitivity analysis and scenario projections."""

    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_sensitivity_analysis(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Identify top variables that most impact revenue and score outcomes."""
        try:
            prompt = f"""You are a financial analyst. Given this market entry analysis data, identify the top 5 variables that most impact revenue potential and overall market entry success.

Market Data:
- Market Opportunity Score: {report_data.get('dashboard_data', {}).get('market_opportunity_score', 'N/A')}
- Competitive Intensity: {report_data.get('dashboard_data', {}).get('competitive_intensity', 'N/A')} (score: {report_data.get('dashboard_data', {}).get('competitive_intensity_score', 'N/A')})
- Entry Complexity Score: {report_data.get('dashboard_data', {}).get('entry_complexity_score', 'N/A')}
- Revenue Potential Y1: {report_data.get('revenue_projections', {}).get('year_1', 'N/A')}
- Revenue Potential Y3: {report_data.get('revenue_projections', {}).get('year_3', 'N/A')}
- Company: {report_data.get('company_name', 'N/A')}
- Industry: {report_data.get('industry', 'N/A')}
- Target Market: {report_data.get('target_market', 'N/A')}

For each variable, provide:
1. variable_name: Short name
2. current_assumption: Current baseline assumption
3. impact_score: How much this variable impacts outcomes (1-10)
4. upside_change: What happens if this variable improves by 20%
5. downside_change: What happens if this variable worsens by 20%

Return ONLY valid JSON in this format:
{{
  "variables": [
    {{
      "variable_name": "Market Growth Rate",
      "current_assumption": "8% annually",
      "impact_score": 9,
      "upside_change": "+15% revenue increase",
      "downside_change": "-12% revenue decrease"
    }}
  ],
  "summary": "Brief 1-2 sentence summary of key sensitivities"
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a financial analysis expert. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=1500
            )

            response_text = response.choices[0].message.content
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"variables": [], "summary": "Unable to generate sensitivity analysis."}

        except Exception as e:
            logger.error(f"Error in sensitivity analysis: {e}")
            return {"variables": [], "summary": f"Error: {str(e)}"}

    def generate_scenario_projections(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate conservative/base/optimistic scenario projections."""
        try:
            prompt = f"""You are a financial analyst. Generate three scenario projections (conservative, base, optimistic) for this market entry.

Market Data:
- Company: {report_data.get('company_name', 'N/A')}
- Industry: {report_data.get('industry', 'N/A')}
- Target Market: {report_data.get('target_market', 'N/A')}
- Market Opportunity Score: {report_data.get('dashboard_data', {}).get('market_opportunity_score', 'N/A')}/10
- Entry Complexity Score: {report_data.get('dashboard_data', {}).get('entry_complexity_score', 'N/A')}/10
- Revenue Y1: {report_data.get('revenue_projections', {}).get('year_1', 'N/A')}
- Revenue Y3: {report_data.get('revenue_projections', {}).get('year_3', 'N/A')}

Return ONLY valid JSON:
{{
  "scenarios": [
    {{
      "name": "Conservative",
      "probability": 30,
      "revenue_y1": "$200K-$400K",
      "revenue_y3": "$1.5M-$3M",
      "market_share_y3": "0.5%",
      "key_assumptions": ["Slow customer acquisition", "High competition"],
      "risks": ["Market downturn", "Regulatory changes"]
    }},
    {{
      "name": "Base Case",
      "probability": 50,
      "revenue_y1": "$400K-$800K",
      "revenue_y3": "$3M-$6M",
      "market_share_y3": "1.2%",
      "key_assumptions": ["Steady growth", "Moderate competition"],
      "risks": ["Execution delays"]
    }},
    {{
      "name": "Optimistic",
      "probability": 20,
      "revenue_y1": "$800K-$1.5M",
      "revenue_y3": "$6M-$12M",
      "market_share_y3": "2.5%",
      "key_assumptions": ["Fast market adoption", "Weak competition"],
      "risks": ["Overexpansion"]
    }}
  ],
  "summary": "Brief overview of scenarios"
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a financial analysis expert. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )

            response_text = response.choices[0].message.content
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"scenarios": [], "summary": "Unable to generate projections."}

        except Exception as e:
            logger.error(f"Error in scenario projections: {e}")
            return {"scenarios": [], "summary": f"Error: {str(e)}"}
