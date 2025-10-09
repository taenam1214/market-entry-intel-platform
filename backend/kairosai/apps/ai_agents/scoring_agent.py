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

### 4. Revenue Projections (CONSERVATIVE BOTTOM-UP APPROACH)

**CRITICAL: Use bottom-up calculation based on ACTUAL operational presence, not market share percentages.**

**Step 1: Determine Realistic Year 1 Presence**
For most new market entrants:
- **Physical Retail/Restaurants/Stores:** 1-3 locations maximum in Year 1
- **SaaS/Digital Products:** 50-200 customers in Year 1
- **B2B Services/Consulting:** 5-20 clients in Year 1
- **E-commerce:** Limited to marketing budget reach

**Step 2: Calculate Revenue Per Unit**

**Physical Locations (stores/restaurants/branches):**
Base on local market conditions and purchasing power:
- **High-Income Markets** (US, Western Europe, Singapore, Japan, S.Korea): $300K-$1M per location/year
- **Upper-Middle Income** (China tier-1, Malaysia, UAE, Saudi Arabia): $150K-$600K per location/year
- **Middle Income** (China tier-2/3, Thailand, Turkey, Mexico): $80K-$400K per location/year
- **Emerging Markets** (India, Vietnam, Indonesia, Philippines): $40K-$250K per location/year

**SaaS/Digital:**
- **Enterprise B2B:** $20K-$80K average annual contract value (ACV)
- **SMB:** $3K-$15K average ACV
- **Consumer SaaS:** Users × $50-$300 annual ARPU

**B2B Services:**
- **Consulting/Professional Services:** $50K-$400K average project value
- **Technical Services:** $30K-$200K average contract

**Step 3: Apply CONSERVATIVE Multipliers**

**Year 1 Revenue = (# of units) × (revenue per unit) × (0.6-0.75 ramp-up factor)**
- Assume only 6-9 months of actual operations
- Account for slow start, learning curve, brand building

**Year 3 Revenue = (# of units scaled) × (revenue per unit) × (0.9-1.0 maturity factor)**
- Realistic scale: 3-10x Year 1 presence (not 100x)
- Established operations at near-full capacity

**REALISTIC CONSERVATIVE RANGES:**

**For Physical Retail/Restaurants:**
- **Year 1:** $30K-$2M (1-3 locations × per-location revenue × 0.6-0.75 ramp-up)
  * Low: 1 location in emerging market × $40K × 0.75 = $30K
  * Mid: 2 locations in mid-income × $200K × 0.7 = $280K
  * High: 3 locations in wealthy market × $800K × 0.75 = $1.8M

- **Year 3:** $500K-$20M (10-25 locations at maturity)
  * Low: 10 locations × $50K = $500K
  * Mid: 15 locations × $350K = $5.3M
  * High: 25 locations × $800K = $20M

**For SaaS/Digital:**
- **Year 1:** $150K-$3M (50-200 customers × ACV × partial year)
- **Year 3:** $1M-$25M (500-2000 customers with expansion revenue)

**For B2B Services:**
- **Year 1:** $200K-$4M (5-20 clients × average project)
- **Year 3:** $1.5M-$35M (20-100 clients with recurring relationships)

**UNCERTAINTY MARGIN (±30-50%):**
Always provide a RANGE to account for:
- Market reception uncertainty
- Execution risks and operational challenges
- Competitive response
- Economic/regulatory changes
- Currency fluctuations (for international markets)

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
  "revenue_potential_y1": "$420K-$1.2M",
  "revenue_potential_y3": "$4M-$12M",
  "revenue_rationale": "Bottom-up calculation: Y1: 2 locations × $300K avg revenue × 0.7 ramp-up = $420K (conservative) to 3 locations × $600K × 0.67 = $1.2M (optimistic). Y3: 12 locations × $350K = $4.2M (conservative) to 20 locations × $600K = $12M (optimistic). Assumes upper-middle income market conditions.",
  "market_share_target_y1": "0.018-0.052%",
  "market_share_target_y3": "0.17-0.52%",
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
7. **Calculate Revenue Using BOTTOM-UP Approach**: 
   - **REQUIRED:** Use # of locations/customers/clients × revenue per unit, NOT market share %
   - **ALWAYS provide a RANGE** (e.g., "$300K-$1.2M") to reflect uncertainty
   - **Show detailed calculation** in revenue_rationale field with conservative and optimistic scenarios
   
   **Example for Physical Business:**
   ```
   Y1: 1-3 locations × $200K-400K per location × 0.6-0.75 ramp-up = $120K-$900K
   Y3: 10-20 locations × $300K-500K per location = $3M-$10M
   ```
   
   **Example for SaaS:**
   ```
   Y1: 80-150 customers × $8K-15K ACV × 0.7 partial year = $450K-$1.6M
   Y3: 600-1200 customers × $10K-18K ACV = $6M-$21.6M
   ```
   
   - **Be CONSERVATIVE:** Assume slow start, realistic scaling (not hockey stick growth)
   - Account for market-specific factors: purchasing power, competition, regulations
   - Market share % is OUTPUT (calculate after revenue), not INPUT

Remember: 
- Scores must be justified by specific data points from the research report
- Revenue must be calculated bottom-up with ranges showing uncertainty
- Be realistic about Year 1: assume 1-3 locations/limited presence, not massive scale
- Year 3 should show 5-10x growth, not 100x
- If data is missing, note this and provide best estimate with lower confidence level
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
            
            # Build additional company context
            additional_context = []
            if company_info.get('customer_segment'):
                additional_context.append(f"Customer Segment: {company_info.get('customer_segment')}")
            if company_info.get('expansion_direction'):
                additional_context.append(f"Expansion Direction: {company_info.get('expansion_direction')}")
            if company_info.get('company_size'):
                additional_context.append(f"Company Size: {company_info.get('company_size')}")
            if company_info.get('annual_revenue'):
                additional_context.append(f"Annual Revenue: {company_info.get('annual_revenue')}")
            if company_info.get('funding_stage'):
                additional_context.append(f"Funding Stage: {company_info.get('funding_stage')}")
            if company_info.get('current_markets'):
                additional_context.append(f"Current Markets: {company_info.get('current_markets')}")
            if company_info.get('key_products'):
                additional_context.append(f"Key Products/Services: {company_info.get('key_products')}")
            if company_info.get('competitive_advantage'):
                additional_context.append(f"Competitive Advantage: {company_info.get('competitive_advantage')}")
            if company_info.get('expansion_timeline'):
                additional_context.append(f"Expansion Timeline: {company_info.get('expansion_timeline')}")
            if company_info.get('budget_range'):
                additional_context.append(f"Budget Range: {company_info.get('budget_range')}")
            if company_info.get('regulatory_requirements'):
                additional_context.append(f"Regulatory Requirements: {company_info.get('regulatory_requirements')}")
            if company_info.get('partnership_preferences'):
                additional_context.append(f"Partnership Preferences: {company_info.get('partnership_preferences')}")
            
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
{chr(10).join(additional_context) if additional_context else ''}

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
        
        # Ensure revenue fields are properly formatted (now accepting ranges)
        for field in ['revenue_potential_y1', 'revenue_potential_y3']:
            if field not in scores or not scores[field]:
                scores[field] = "$300K-$1M"
            elif not scores[field].startswith('$'):
                scores[field] = f"${scores[field]}"
        
        # Ensure market share targets are properly formatted (now accepting ranges)
        for field in ['market_share_target_y1', 'market_share_target_y3']:
            if field not in scores or not scores[field]:
                scores[field] = "0.1-0.5%"
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
            "revenue_potential_y1": "$200K-$800K",
            "revenue_potential_y3": "$2M-$8M",
            "revenue_rationale": "Conservative default projections based on 1-3 locations in Year 1, scaling to 8-15 locations by Year 3. Detailed analysis pending.",
            "market_share_target_y1": "0.05-0.2%",
            "market_share_target_y3": "0.3-1.2%",
            "confidence_level": "Low",
            "key_assumptions": ["Analysis requires manual review due to processing error"],
            "critical_success_factors": ["Detailed market analysis needed"],
            "major_risks": ["Analysis incomplete due to technical issues"],
            "error_info": error_reason
        }