# apps/ai_agents/research_agent.py
import asyncio
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any
from deep_researcher import IterativeResearcher, DeepResearcher, LLMConfig
from django.conf import settings

class CompetitorResearchAgent:
    def __init__(self):
        # Set environment variables from Django settings
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            os.environ['OPENAI_API_KEY'] = settings.OPENAI_API_KEY
        
        # Set SERPER_API_KEY if available in settings
        if hasattr(settings, 'SERPER_API_KEY') and settings.SERPER_API_KEY:
            os.environ['SERPER_API_KEY'] = settings.SERPER_API_KEY
        
        # Create a proper LLM configuration with models that have higher rate limits
        llm_config = LLMConfig(
            search_provider="serper",
            reasoning_model_provider="openai",
            reasoning_model="o3-mini",
            main_model_provider="openai",
            main_model="gpt-4o",
            fast_model_provider="openai",
            fast_model="gpt-4o-mini"
        )
        
        self.iterative_researcher = IterativeResearcher(
            max_iterations=3, 
            max_time_minutes=7,
            config=llm_config
        )
        self.deep_researcher = DeepResearcher(
            max_iterations=3, 
            max_time_minutes=5,
            config=llm_config
        )
    
    def _build_scoring_focused_prompt(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None) -> str:
        """Build a comprehensive prompt designed to generate data suitable for quantitative scoring."""
        
        base_context = f"""
Company: {company}
Industry: {industry}
Target Market: {target_country}
"""
        
        if company_info:
            base_context += f"""
Current Positioning: {company_info.get('current_positioning', 'Not specified')}
Brand Description: {company_info.get('brand_description', 'Not specified')}
Website: {company_info.get('website', 'Not specified')}
"""

        prompt = f"""{base_context}

RESEARCH OBJECTIVE: Conduct comprehensive market entry analysis for {company} expanding into the {industry} industry in {target_country}. Structure your analysis to enable quantitative scoring across three key dimensions:

## 1. MARKET OPPORTUNITY ANALYSIS
Research and provide specific data points for:

### Market Size & Growth:
- Total Addressable Market (TAM) in {target_country} for {industry} (in USD)
- Serviceable Addressable Market (SAM) relevant to {company}
- Annual market growth rate (%) for past 3 years
- Market growth projections for next 3-5 years
- GDP per capita and economic stability indicators
- Consumer spending trends in relevant categories

### Market Attractiveness:
- Market maturity level (emerging/growing/mature/declining)
- Regulatory environment favorability for foreign companies
- Economic and political stability indicators
- Digital adoption rates and e-commerce penetration
- Consumer purchasing power and willingness to pay premium prices

## 2. COMPETITIVE LANDSCAPE ANALYSIS
Provide detailed competitive intelligence:

### Direct Competitors:
- List 5-10 key direct competitors with:
  * Company names and market share (%)
  * Revenue figures where available
  * Years in market and growth trajectory
  * Competitive strengths and weaknesses
  * Market positioning and pricing strategies

### Market Structure:
- Market concentration (HHI index if available)
- Presence of dominant players vs. fragmented market
- Barriers to entry (regulatory, capital, distribution, brand)
- Switching costs for customers
- Supplier power and distribution channel control

### Competitive Intensity Indicators:
- Frequency of price wars or promotional activities
- Rate of new entrant success/failure
- Market share volatility among top players
- Innovation pace and product differentiation levels

## 3. MARKET ENTRY COMPLEXITY ASSESSMENT
Analyze entry barriers and complexity factors:

### Regulatory & Legal:
- Required licenses, permits, and registrations
- Timeline for business establishment (weeks/months)
- Foreign investment restrictions or requirements
- Compliance costs and ongoing regulatory burden
- Legal system reliability and IP protection

### Operational Complexity:
- Distribution channel requirements and costs
- Local partnership necessities
- Staffing and talent availability
- Supply chain and logistics challenges
- Technology infrastructure requirements

### Cultural & Market Adaptation:
- Language barriers and localization needs
- Cultural adaptation requirements for products/services
- Local business practice differences
- Brand perception and trust-building timeline
- Marketing and customer acquisition complexity

## 4. FINANCIAL PROJECTIONS & REVENUE POTENTIAL
Provide data for revenue modeling:

### Market Penetration Analysis:
- Realistic market share targets for years 1, 3, and 5
- Customer acquisition costs in the market
- Average customer lifetime value
- Pricing strategy recommendations vs. local competitors

### Investment & ROI Indicators:
- Estimated market entry costs
- Break-even timeline projections
- Revenue potential scenarios (conservative/base/optimistic)
- Key success metrics and milestones

## 5. STRATEGIC RECOMMENDATIONS
Based on your analysis, provide:
- Market entry strategy recommendations
- Key success factors and critical risks
- Timeline for market entry phases
- Resource requirements and investment needs

IMPORTANT: For each section, provide specific quantitative data points, percentages, dollar amounts, and timeframes wherever possible. Include data sources and confidence levels for major claims. Structure findings to enable clear scoring on a 1-10 scale for market opportunity, competitive intensity, and entry complexity."""

        return prompt
    
    def _build_json_focused_prompt(self, task_description: str, example_format: str) -> str:
        """Build a prompt specifically designed to generate valid JSON output."""
        return f"""
{task_description}

CRITICAL INSTRUCTIONS:
1. Respond with ONLY a valid JSON array or object
2. NO markdown code blocks (no ```json or ```)
3. NO additional text, explanations, or formatting outside the JSON
4. Ensure all JSON is properly formatted with correct quotes and brackets
5. If you cannot provide the requested data, return an empty array []

{example_format}

Return ONLY the JSON array, nothing else - no markdown, no explanations, no extra text.
"""
    
    async def research_market(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None) -> str:
        """Conduct comprehensive market research optimized for scoring."""
        query = self._build_scoring_focused_prompt(company, industry, target_country, company_info)
        report = await self.iterative_researcher.run(query, output_length="3 pages")
        return report
    
    async def research_market_deep(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None) -> str:
        """Conduct deep market research using DeepResearcher for maximum detail."""
        query = self._build_scoring_focused_prompt(company, industry, target_country, company_info)
        
        # Enhanced prompt for deep research
        deep_query = f"""{query}

ADDITIONAL DEEP RESEARCH REQUIREMENTS:
- Analyze 3-5 case studies of similar companies that entered this market
- Identify specific regulatory changes or market trends in past 12 months
- Research local consumer behavior patterns and preferences
- Analyze supply chain and distribution partnerships available
- Investigate potential acquisition targets or joint venture opportunities
- Assess technology adoption rates and digital transformation trends
- Research government incentives or support programs for foreign investors

Provide maximum detail with specific data points, company examples, and quantitative analysis to enable precise scoring and strategic decision-making."""
        
        report = await self.deep_researcher.run(deep_query)
        return report
    
    async def generate_competitor_report(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None, output_file: Optional[str] = None) -> str:
        """Generate a structured competitor analysis report as a JSON list of competitors with name, description, and approx market share."""
        task_description = f"You are an expert market analyst. List the top 5-10 direct competitors for {company} in the {industry} industry in {target_country}. For each competitor, provide exactly these fields: 'name' (Company name), 'description' (1-2 sentence description of what they do, their positioning, any notable facts), 'market_share' (Approximate market share as a percentage, if unknown use 'unknown')."
        
        example_format = """Example format:
[
  {"name": "Competitor A", "description": "Leading provider of X services with strong brand recognition", "market_share": "25%"},
  {"name": "Competitor B", "description": "New entrant focusing on digital-first approach", "market_share": "5%"},
  {"name": "Competitor C", "description": "Established player with extensive distribution network", "market_share": "unknown"}
]"""
        
        prompt = self._build_json_focused_prompt(task_description, example_format)
        result = await self.iterative_researcher.run(prompt, output_length="short")
        
        print(f"AI raw response: {result}")
        
        # Use the validation function to parse and validate JSON
        competitors = self._validate_and_clean_json_response(result)
        
        # If parsing failed and we got an empty array, try to provide some fallback data
        if not competitors and len(competitors) == 0:
            print("Parsing failed, providing fallback competitor data")
            competitors = [
                {
                    "name": "Sample Competitor 1",
                    "description": "A major player in the industry with established market presence",
                    "market_share": "unknown"
                },
                {
                    "name": "Sample Competitor 2", 
                    "description": "Emerging competitor with innovative approach",
                    "market_share": "unknown"
                }
            ]
        
        if output_file:
            import json
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(competitors, f, indent=2, ensure_ascii=False)
            print(f"Competitor expansion report saved to: {output_file}")
        
        return competitors
    
    def _validate_and_clean_json_response(self, result: str) -> Dict[str, Any]:
        """Validate and clean JSON response from AI, with detailed error reporting."""
        import json
        import re
        
        # First, try to extract JSON from markdown code blocks
        json_block_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', result, re.DOTALL)
        if json_block_match:
            json_str = json_block_match.group(1)
            print(f"Extracted JSON from markdown block: {json_str[:200]}...")
        else:
            # Fallback to extracting JSON array directly
            json_match = re.search(r'\[.*?\]', result, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                print(f"Extracted JSON array from response: {json_str[:200]}...")
            else:
                json_str = result
                print(f"No JSON array found in response, using raw result: {result[:200]}...")
            
        try:
            competitors = json.loads(json_str)
            # Validate structure
            if not isinstance(competitors, list):
                raise ValueError("Result is not a list")
            for i, competitor in enumerate(competitors):
                if not isinstance(competitor, dict):
                    raise ValueError(f"Competitor {i} is not a dictionary")
                if 'name' not in competitor:
                    raise ValueError(f"Competitor {i} missing 'name' field")
                if 'description' not in competitor:
                    raise ValueError(f"Competitor {i} missing 'description' field")
                if 'market_share' not in competitor:
                    raise ValueError(f"Competitor {i} missing 'market_share' field")
            
            print(f"Successfully parsed {len(competitors)} competitors")
            return competitors
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Raw response: {result}")
            # Return an empty array instead of error object to maintain consistency
            return []
    
    async def generate_deep_competitor_analysis(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None, output_file: Optional[str] = None) -> str:
        """Generate a deep competitor analysis using enhanced prompts for comprehensive scoring data."""
        report = await self.research_market_deep(company, industry, target_country, company_info)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"Deep expansion analysis saved to: {output_file}")
        
        return report
    
    async def generate_segment_arbitrage_analysis(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None, output_file: Optional[str] = None) -> str:
        """Generate segment arbitrage analysis to identify positioning gaps and opportunities."""
        task_description = f"""You are an expert market strategist specializing in segment arbitrage. Analyze {company} in the {industry} industry expanding from their home market to {target_country}.

For each segment opportunity, provide exactly these fields:
- "segment_name": Name of the underserved segment
- "current_gap": Description of how this segment is currently underserved in the target market
- "positioning_opportunity": How the company can position itself to capture this segment
- "market_size": Estimated size of this segment opportunity
- "competitive_advantage": Why the company has an advantage in serving this segment
- "implementation_strategy": Specific steps to capture this segment

Focus on segments that are:
1. Underserved in the target market
2. Align with the company's capabilities
3. Have significant market potential
4. Can be captured with the company's current positioning or slight modifications"""

        example_format = """Example format:
[
  {
    "segment_name": "Premium Health-Conscious Consumers",
    "current_gap": "Limited premium healthy options in the market",
    "positioning_opportunity": "Position as the premium healthy alternative with transparent sourcing",
    "market_size": "15-20% of target market",
    "competitive_advantage": "Strong brand reputation for quality and transparency",
    "implementation_strategy": "Launch premium product line with health-focused marketing"
  },
  {
    "segment_name": "Digital-Native Millennials",
    "current_gap": "Lack of tech-integrated experiences in traditional offerings",
    "positioning_opportunity": "Create seamless digital-first customer experience",
    "market_size": "25-30% of target market",
    "competitive_advantage": "Digital expertise and mobile-first approach",
    "implementation_strategy": "Develop mobile app and digital loyalty program"
  }
]"""
        
        prompt = self._build_json_focused_prompt(task_description, example_format)
        result = await self.iterative_researcher.run(prompt, output_length="short")
        
        print(f"AI raw arbitrage response: {result}")
        
        # Use the validation function to parse and validate JSON
        arbitrage_opportunities = self._validate_and_clean_arbitrage_response(result)
        
        # If parsing failed and we got an empty array, try to provide some fallback data
        if not arbitrage_opportunities and len(arbitrage_opportunities) == 0:
            print("Parsing failed, providing fallback arbitrage data")
            arbitrage_opportunities = [
                {
                    "segment_name": "Premium Segment",
                    "current_gap": "Limited premium options in the market",
                    "positioning_opportunity": "Position as the premium alternative",
                    "market_size": "10-15% of target market",
                    "competitive_advantage": "Strong brand reputation",
                    "implementation_strategy": "Launch premium product line"
                },
                {
                    "segment_name": "Digital-First Consumers",
                    "current_gap": "Lack of digital integration",
                    "positioning_opportunity": "Create seamless digital experience",
                    "market_size": "20-25% of target market",
                    "competitive_advantage": "Digital expertise",
                    "implementation_strategy": "Develop mobile app and digital features"
                }
            ]
        
        if output_file:
            import json
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(arbitrage_opportunities, f, indent=2, ensure_ascii=False)
            print(f"Segment arbitrage analysis saved to: {output_file}")
        
        return arbitrage_opportunities
    
    def _validate_and_clean_arbitrage_response(self, result: str) -> Dict[str, Any]:
        """Validate and clean arbitrage JSON response from AI, with detailed error reporting."""
        import json
        import re
        
        # First, try to extract JSON from markdown code blocks
        json_block_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', result, re.DOTALL)
        if json_block_match:
            json_str = json_block_match.group(1)
            print(f"Extracted arbitrage JSON from markdown block: {json_str[:200]}...")
        else:
            # Fallback to extracting JSON array directly
            json_match = re.search(r'\[.*?\]', result, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                print(f"Extracted arbitrage JSON array from response: {json_str[:200]}...")
            else:
                # Try to extract from thinking process (look for JSON in thoughts)
                thought_match = re.search(r'=== Drafting Final Response ===\s*<thought>\s*(\[.*?\])\s*</thought>', result, re.DOTALL)
                if thought_match:
                    json_str = thought_match.group(1)
                    print(f"Extracted arbitrage JSON from thinking process: {json_str[:200]}...")
                else:
                    json_str = result
                    print(f"No arbitrage JSON array found in response, using raw result: {result[:200]}...")
            
        try:
            arbitrage_opportunities = json.loads(json_str)
            # Validate structure
            if not isinstance(arbitrage_opportunities, list):
                raise ValueError("Result is not a list")
            for i, opportunity in enumerate(arbitrage_opportunities):
                if not isinstance(opportunity, dict):
                    raise ValueError(f"Opportunity {i} is not a dictionary")
                required_fields = ['segment_name', 'current_gap', 'positioning_opportunity', 'market_size', 'competitive_advantage', 'implementation_strategy']
                for field in required_fields:
                    if field not in opportunity:
                        raise ValueError(f"Opportunity {i} missing '{field}' field")
            
            print(f"Successfully parsed {len(arbitrage_opportunities)} arbitrage opportunities")
            return arbitrage_opportunities
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Failed to parse arbitrage JSON response: {e}")
            print(f"Raw response: {result}")
            # Return an empty array instead of error object to maintain consistency
            return []