import json
import logging
import re
from typing import Dict, Any, Tuple
import openai
from django.conf import settings

logger = logging.getLogger(__name__)

class MarketScoringAgent:
    """
    Advanced scoring agent that uses LLM to convert research reports into quantified dashboard metrics.
    """
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.scoring_prompt = self._load_scoring_framework()
    
    def _load_scoring_framework(self) -> str:
        return """
You are an expert market analysis scoring specialist. Your task is to analyze market research reports and convert them into precise numerical scores for executive dashboards.

## SCORING FRAMEWORK

### 1. Market Opportunity Score (0-10 scale)
**Weight Distribution:**
- Market Size (30%): TAM, SAM, market value
- Growth Rate (25%): YoY growth, future projections  
- Economic Factors (20%): GDP per capita, stability, purchasing power
- Market Maturity (15%): Development stage, saturation level
- Regulatory Environment (10%): Ease of foreign entry, government support

**Scoring Guidelines:**
- **9.0-10.0**: Large market (>$1B TAM), high growth (>15%), stable/rich economy, emerging/growing market, very favorable regulations
- **7.0-8.9**: Medium-large market ($100M-1B TAM), good growth (8-15%), stable economy, growing market, favorable regulations
- **5.0-6.9**: Medium market ($50-100M TAM), moderate growth (3-8%), moderate economy, mature market, neutral regulations
- **3.0-4.9**: Small market ($10-50M TAM), slow growth (0-3%), economic challenges, declining market, restrictive regulations
- **1.0-2.9**: Very small market (<$10M TAM), negative growth, unstable economy, saturated/declining market, hostile regulations

### 2. Competitive Intensity (Low/Medium/High + numerical score 1-10)
**Assessment Factors:**
- Number of competitors and market concentration
- Market share distribution (HHI index if available)
- Competitive actions (price wars, innovation pace)
- Barriers to entry and switching costs
- New entrant success rate

**Classification:**
- **Low (1.0-3.9)**: <5 major competitors, fragmented market (HHI <1500), minimal price competition, low barriers, easy market entry
- **Medium (4.0-6.9)**: 5-15 competitors, moderate concentration (HHI 1500-2500), some competitive pressure, medium barriers
- **High (7.0-10.0)**: >15 competitors or oligopoly (HHI >2500), intense price competition, high barriers, difficult entry

### 3. Entry Complexity Score (0-10 scale, where 10 = most complex)
**Complexity Factors:**
- Regulatory requirements and timeline
- Cultural and language barriers
- Distribution and partnership needs
- Capital requirements and setup costs
- Legal and compliance complexity

**Scoring Guidelines:**
- **1.0-2.9**: Minimal regulation, <3 months setup, similar culture/language, simple distribution, low capital needs
- **3.0-4.9**: Light regulation, 3-6 months setup, minor cultural differences, standard distribution, moderate capital
- **5.0-6.9**: Moderate regulation, 6-12 months setup, notable cultural adaptation, complex distribution, significant capital
- **7.0-8.9**: Heavy regulation, 12-18 months setup, major cultural barriers, difficult distribution, high capital needs
- **9.0-10.0**: Complex regulation, >18 months setup, extreme cultural/legal barriers, restricted distribution, very high capital

### 4. Revenue Projections
**Calculation Method:**
- Use market size, realistic market share targets, and pricing analysis
- Consider customer acquisition costs and lifetime value
- Factor in ramp-up timeline and market penetration rates
- Provide conservative estimates with clear assumptions

### 5. Market Share Targets
**Realistic Targets:**
- Year 1: Typically 0.1-1% of market for new entrants
- Year 3: 1-5% depending on market size and competition
- Consider company size, resources, and competitive landscape

## OUTPUT FORMAT
Provide your analysis in this exact JSON structure:

```json
{
  "market_opportunity_score": 8.7,
  "market_opportunity_rationale": "Large addressable market ($2.3B TAM) with strong 12% annual growth. Stable economy with rising consumer spending in target category. Favorable regulatory environment for foreign investment.",
  "competitive_intensity": "Medium",
  "competitive_intensity_score": 5.2,
  "competitive_intensity_rationale": "Moderate competition with 8 key players. Market leader has 25% share but no dominant monopoly. Some price competition but room for differentiation.",
  "entry_complexity_score": 6.2,
  "entry_complexity_rationale": "Standard regulatory requirements taking 8-10 months. Moderate cultural adaptation needed. Established distribution channels available but require partnerships.",
  "revenue_potential_y1": "$2.4M",
  "revenue_potential_y3": "$8.7M",
  "revenue_rationale": "Based on 0.5% market share Y1 growing to 2.1% Y3, with average selling price of $X and customer acquisition rate of Y",
  "market_share_target_y1": "0.5%",
  "market_share_target_y3": "2.1%",
  "confidence_level": "High",
  "key_assumptions": [
    "Market growth continues at current 12% rate",
    "Successful cultural adaptation and brand positioning", 
    "Partnership with local distributor achieved within 6 months"
  ],
  "critical_success_factors": [
    "Local partnership for distribution",
    "Cultural adaptation of product/messaging",
    "Competitive pricing strategy"
  ],
  "major_risks": [
    "Regulatory changes affecting foreign companies",
    "Aggressive competitor response to market entry",
    "Economic downturn affecting consumer spending"
  ]
}
```

## ANALYSIS INSTRUCTIONS
1. **Extract Quantitative Data**: Look for specific numbers, percentages, dollar amounts, timeframes
2. **Identify Market Indicators**: Market size, growth rates, competitor counts, market shares
3. **Assess Complexity Factors**: Regulatory requirements, cultural barriers, setup timelines
4. **Calculate Scores**: Use the rubrics above with extracted data points
5. **Provide Clear Rationale**: Explain how you arrived at each score with specific evidence
6. **Flag Confidence Levels**: High (strong data), Medium (some gaps), Low (limited data)

Remember: Scores must be justified by specific data points from the research report. If data is missing for a category, note this and provide best estimate with lower confidence level.
"""
    
    def _extract_numbers_from_text(self, text: str) -> Dict[str, Any]:
        """Extract quantitative data points from research report using regex."""
        extracted_data = {}
        
        # Market size patterns
        market_size_patterns = [
            r'\$([0-9,.]+)\s*(billion|million|B|M)\s*(TAM|market|size)',
            r'market.*size.*\$([0-9,.]+)\s*(billion|million|B|M)',
            r'(\$[0-9,.]+\s*(?:billion|million|B|M)).*market'
        ]
        
        # Growth rate patterns
        growth_patterns = [
            r'([0-9,.]+)%.*growth',
            r'growth.*([0-9,.]+)%',
            r'growing.*([0-9,.]+)%'
        ]
        
        # Competitor count patterns
        competitor_patterns = [
            r'([0-9]+)\s*(?:major|key|main)?\s*competitors',
            r'competitors.*([0-9]+)',
            r'([0-9]+)\s*companies.*competing'
        ]
        
        # Extract market size
        for pattern in market_size_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                extracted_data['market_size_mentions'] = matches[:3]  # Top 3 matches
                break
        
        # Extract growth rates
        growth_matches = re.findall(r'([0-9,.]+)%', text)
        if growth_matches:
            extracted_data['percentage_mentions'] = [float(m.replace(',', '')) for m in growth_matches[:5]]
        
        # Extract competitor counts
        for pattern in competitor_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                extracted_data['competitor_counts'] = [int(m) for m in matches[:3]]
                break
        
        return extracted_data
    
    def score_research_report(self, research_report: str, company_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert research report into precise dashboard scores using LLM analysis.
        """
        try:
            # Extract quantitative data for context
            extracted_data = self._extract_numbers_from_text(research_report)
            
            # Prepare the scoring request
            analysis_prompt = f"""
{self.scoring_prompt}

## RESEARCH REPORT TO ANALYZE:
{research_report}

## COMPANY CONTEXT:
Company: {company_info.get('company_name', 'Unknown')}
Industry: {company_info.get('industry', 'Unknown')}
Target Market: {company_info.get('target_market', 'Unknown')}
Current Positioning: {company_info.get('current_positioning', 'Not specified')}
Brand Description: {company_info.get('brand_description', 'Not specified')}

## EXTRACTED DATA POINTS:
{json.dumps(extracted_data, indent=2)}

Now analyze this research report and provide scores in the exact JSON format specified above. Base your scoring on specific data points from the report and provide detailed rationale for each score.
"""

            # Call OpenAI to generate scores
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert market analysis scoring specialist. Analyze research reports and provide precise numerical scores with detailed rationale."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.1,  # Low temperature for consistent scoring
                max_tokens=2000
            )
            
            # Parse the response
            response_text = response.choices[0].message.content
            
            # Extract JSON from response
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                scores_json = json_match.group(1)
            else:
                # Fallback: try to find JSON in the response
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    scores_json = response_text[json_start:json_end]
                else:
                    raise ValueError("No valid JSON found in LLM response")
            
            # Parse and validate JSON
            scores = json.loads(scores_json)
            
            # Validate required fields and add defaults if missing
            scores = self._validate_and_clean_scores(scores, company_info)
            
            logger.info(f"Generated LLM scores for {company_info.get('company_name')}: {scores}")
            return scores
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error in scoring: {e}")
            return self._generate_fallback_scores(company_info, "JSON parsing error")
            
        except Exception as e:
            logger.error(f"Error in LLM scoring: {e}")
            return self._generate_fallback_scores(company_info, str(e))
    
    def _validate_and_clean_scores(self, scores: Dict[str, Any], company_info: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the scores returned by the LLM."""
        
        # Ensure required numeric fields are present and valid
        numeric_fields = {
            'market_opportunity_score': (0, 10, 5.0),
            'competitive_intensity_score': (0, 10, 5.0), 
            'entry_complexity_score': (0, 10, 5.0)
        }
        
        for field, (min_val, max_val, default) in numeric_fields.items():
            if field not in scores:
                scores[field] = default
            else:
                try:
                    val = float(scores[field])
                    scores[field] = max(min_val, min(max_val, val))  # Clamp to range
                except (ValueError, TypeError):
                    scores[field] = default
        
        # Ensure competitive intensity is valid
        if 'competitive_intensity' not in scores or scores['competitive_intensity'] not in ['Low', 'Medium', 'High']:
            intensity_score = scores.get('competitive_intensity_score', 5.0)
            if intensity_score <= 3.9:
                scores['competitive_intensity'] = 'Low'
            elif intensity_score <= 6.9:
                scores['competitive_intensity'] = 'Medium'
            else:
                scores['competitive_intensity'] = 'High'
        
        # Ensure revenue fields are properly formatted
        for field in ['revenue_potential_y1', 'revenue_potential_y3']:
            if field not in scores or not scores[field]:
                scores[field] = "$1.0M"
            elif not scores[field].startswith('$'):
                scores[field] = f"${scores[field]}"
        
        # Ensure market share targets are properly formatted
        for field in ['market_share_target_y1', 'market_share_target_y3']:
            if field not in scores or not scores[field]:
                scores[field] = "1.0%"
            elif not scores[field].endswith('%'):
                scores[field] = f"{scores[field]}%"
        
        # Add default rationale if missing
        default_rationales = {
            'market_opportunity_rationale': f"Market analysis for {company_info.get('company_name', 'company')} in {company_info.get('target_market', 'target market')}",
            'competitive_intensity_rationale': f"Competitive landscape assessment for {company_info.get('industry', 'industry')} sector",
            'entry_complexity_rationale': f"Market entry complexity evaluation for {company_info.get('target_market', 'target market')}",
            'revenue_rationale': "Revenue projections based on market size and penetration assumptions"
        }
        
        for field, default_text in default_rationales.items():
            if field not in scores or not scores[field]:
                scores[field] = default_text
        
        # Ensure confidence level is set
        if 'confidence_level' not in scores:
            scores['confidence_level'] = 'Medium'
        
        # Ensure arrays exist
        for field in ['key_assumptions', 'critical_success_factors', 'major_risks']:
            if field not in scores or not isinstance(scores[field], list):
                scores[field] = [f"Analysis pending for {field.replace('_', ' ')}"]
        
        return scores
    
    def _generate_fallback_scores(self, company_info: Dict[str, Any], error_reason: str) -> Dict[str, Any]:
        """Generate fallback scores when LLM scoring fails."""
        company_name = company_info.get('company_name', 'Unknown Company')
        target_market = company_info.get('target_market', 'Unknown Market')
        
        return {
            "market_opportunity_score": 5.0,
            "market_opportunity_rationale": f"Default scoring due to analysis error: {error_reason}",
            "competitive_intensity": "Medium",
            "competitive_intensity_score": 5.0,
            "competitive_intensity_rationale": f"Default competitive assessment for {company_name}",
            "entry_complexity_score": 5.0,
            "entry_complexity_rationale": f"Default complexity assessment for {target_market}",
            "revenue_potential_y1": "$1.0M",
            "revenue_potential_y3": "$3.0M",
            "revenue_rationale": "Conservative default projections pending detailed analysis",
            "market_share_target_y1": "0.5%",
            "market_share_target_y3": "1.5%",
            "confidence_level": "Low",
            "key_assumptions": ["Analysis requires manual review due to processing error"],
            "critical_success_factors": ["Detailed market analysis needed"],
            "major_risks": ["Analysis incomplete due to technical issues"],
            "error_info": error_reason
        }