# apps/ai_agents/research_agent.py
import asyncio
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any
from deep_researcher import IterativeResearcher, DeepResearcher, LLMConfig
from django.conf import settings

class CompetitorResearchAgent:
    def __init__(self, cycles='3'):
        # Set environment variables from Django settings
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            os.environ['OPENAI_API_KEY'] = settings.OPENAI_API_KEY
        
        # Set SERPER_API_KEY if available in settings
        if hasattr(settings, 'SERPER_API_KEY') and settings.SERPER_API_KEY:
            os.environ['SERPER_API_KEY'] = settings.SERPER_API_KEY
        
        # Create a proper LLM configuration with best models (sequential execution avoids rate limits)
        # llm_config = LLMConfig(
        #     search_provider="serper",
        #     reasoning_model_provider="openai",
        #     reasoning_model="o1",  # Best reasoning model - sequential execution avoids rate limits
        #     main_model_provider="openai",
        #     main_model="gpt-4o",  # Best general model
        #     fast_model_provider="openai",
        #     fast_model="gpt-4o"  # High quality throughout
        # )

        llm_config = LLMConfig(
            search_provider="serper",
            reasoning_model_provider="openai",
            reasoning_model="o3-mini",
            main_model_provider="openai",
            main_model="gpt-4o",
            fast_model_provider="openai",
            fast_model="gpt-4o-mini"
        )
        
        # Configure iterations and time based on cycles
        cycles_config = self._get_cycles_config(cycles)
        
        self.iterative_researcher = IterativeResearcher(
            max_iterations=cycles_config['max_iterations'], 
            max_time_minutes=cycles_config['max_time_minutes'],
            config=llm_config
        )
        self.deep_researcher = DeepResearcher(
            max_iterations=cycles_config['deep_max_iterations'], 
            max_time_minutes=cycles_config['deep_max_time_minutes'],
            config=llm_config
        )
    
    def _get_cycles_config(self, cycles):
        """Get configuration based on cycles parameter"""
        cycles_configs = {
            '3': {
                'max_iterations': 4,
                'max_time_minutes': 7,
                'deep_max_iterations': 4,
                'deep_max_time_minutes': 7
            },
            '5': {
                'max_iterations': 6,
                'max_time_minutes': 10,
                'deep_max_iterations': 6,
                'deep_max_time_minutes': 10
            },
            '7': {
                'max_iterations': 8,
                'max_time_minutes': 15,
                'deep_max_iterations': 8,
                'deep_max_time_minutes': 15
            },
            '10': {
                'max_iterations': 10,
                'max_time_minutes': 20,
                'deep_max_iterations': 10,
                'deep_max_time_minutes': 20
            },
            '20': {
                'max_iterations': 20,
                'max_time_minutes': 40,
                'deep_max_iterations': 20,
                'deep_max_time_minutes': 40
            }
        }
        return cycles_configs.get(cycles, cycles_configs['3'])
    
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
            
            # Add additional company context if available
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
            
            if additional_context:
                base_context += "\nAdditional Company Context:\n" + "\n".join(additional_context) + "\n"

        prompt = f"""{base_context}

RESEARCH OBJECTIVE: Conduct comprehensive market entry analysis for {company} expanding into the {industry} industry in {target_country}. Structure your analysis to enable quantitative scoring across three key dimensions:

## 1. MARKET OPPORTUNITY ANALYSIS
Research and provide specific data points for:

### Market Size & Growth:
- Total Addressable Market (TAM) in {target_country} for {industry} (in USD - VERIFY currency is USD not local currency)
  * SANITY CHECK: For most industries, country-specific TAM should be $100M-$10B range, NOT $100B+
  * Cross-validate with global market size - a single country's TAM should be a fraction of global TAM
  * If you find a number in billions, verify it's not in local currency (INR, VND, etc.) converted incorrectly
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
CRITICAL: Focus ONLY on competitors that are ALREADY OPERATING in {target_country}. Do NOT include competitors from {company}'s home market or other countries unless they have established operations in {target_country}.

Provide detailed competitive intelligence:

### Direct Competitors in {target_country}:
- List 5-10 key direct competitors that are CURRENTLY OPERATING in {target_country} with:
  * Company names and verified market share (%) - ONLY include verified data from reliable sources
  * Revenue figures where available from public sources
  * Years operating in {target_country} and growth trajectory
  * Competitive strengths and weaknesses specific to the {target_country} market
  * Market positioning and pricing strategies in {target_country}
  * Distribution channels and market presence in {target_country}

### Market Structure in {target_country}:
- Market concentration (HHI index if available) specifically in {target_country}
- Presence of dominant players vs. fragmented market in {target_country}
- Barriers to entry (regulatory, capital, distribution, brand) specific to {target_country}
- Switching costs for customers in {target_country}
- Supplier power and distribution channel control in {target_country}

### Competitive Intensity Indicators:
- Frequency of price wars or promotional activities in {target_country}
- Rate of new entrant success/failure in {target_country}
- Market share volatility among top players in {target_country}
- Innovation pace and product differentiation levels in {target_country}

## 3. MARKET ENTRY COMPLEXITY ASSESSMENT
Provide detailed analysis of entry barriers and complexity factors specific to {target_country}:

### Regulatory & Legal Requirements:
- Required licenses, permits, and registrations for foreign companies in {target_country}
- Timeline for business establishment (weeks/months) with specific steps
- Foreign investment restrictions or requirements for {target_country}
- Compliance costs and ongoing regulatory burden with specific dollar amounts
- Legal system reliability and IP protection in {target_country}
- Tax implications and requirements for foreign companies
- Employment law requirements and restrictions
- Data protection and privacy regulations

### Operational Complexity:
- Distribution channel requirements and costs in {target_country}
- Local partnership necessities and typical partnership structures
- Staffing and talent availability with specific skill requirements
- Supply chain and logistics challenges specific to {target_country}
- Technology infrastructure requirements and costs
- Real estate and facility requirements
- Local banking and financial services requirements
- Insurance and liability requirements

### Cultural & Market Adaptation:
- Language barriers and localization needs for {target_country}
- Cultural adaptation requirements for products/services
- Local business practice differences and relationship building requirements
- Brand perception and trust-building timeline in {target_country}
- Marketing and customer acquisition complexity
- Local consumer behavior patterns and preferences
- Seasonal and cultural considerations affecting business operations
- Local media landscape and advertising regulations

### Financial & Investment Requirements:
- Minimum capital requirements for foreign companies
- Currency exchange considerations and risks
- Banking relationships and financial infrastructure needs
- Insurance requirements and costs
- Bonding and guarantee requirements

### Technology & Infrastructure:
- Digital infrastructure requirements and costs
- Technology platform compatibility requirements
- Data hosting and security requirements
- Integration with local systems and platforms

## 4. FINANCIAL PROJECTIONS & REVENUE POTENTIAL
Provide data for revenue modeling:

### Market Penetration Analysis:
- Realistic market share targets for years 1, 3, and 5 in {target_country}
- Customer acquisition costs in the {target_country} market
- Average customer lifetime value in {target_country}
- Pricing strategy recommendations vs. local competitors in {target_country}

### Investment & ROI Indicators:
- Estimated market entry costs with detailed breakdown
- Break-even timeline projections with specific milestones
- Revenue potential scenarios (conservative/base/optimistic)
- Key success metrics and milestones

## 5. STRATEGIC RECOMMENDATIONS
Based on your analysis, provide:
- Market entry strategy recommendations specific to {target_country}
- Key success factors and critical risks for {target_country}
- Timeline for market entry phases with specific milestones
- Resource requirements and investment needs

IMPORTANT REQUIREMENTS:
1. For each section, provide specific quantitative data points, percentages, dollar amounts, and timeframes wherever possible
2. Include data sources and confidence levels for major claims
3. Structure findings to enable clear scoring on a 1-10 scale for market opportunity, competitive intensity, and entry complexity
4. ONLY include competitors that are verified to be operating in {target_country}
5. Verify all market share and revenue data from reliable sources before including
6. Focus on {target_country}-specific regulations, costs, and requirements
7. Provide detailed, actionable information for each complexity factor

CRITICAL DATA VERIFICATION RULES:
8. ALWAYS verify currency is USD, not local currency (INR, VND, BRL, etc.)
9. SANITY CHECK all market sizes: Country-level TAM rarely exceeds $50B unless it's a massive industry (automotive, real estate, etc.)
10. Cross-validate numbers: If India music streaming TAM is $500B, that's WRONG (global music industry is ~$26B)
11. Check reasonableness: If a single country has 90% of global market, verify extensively
12. When citing market size, explicitly state the source, year, and currency
13. If numbers seem extreme (too high or too low), find 2-3 additional sources to confirm
14. Common sense check: Does this number make sense relative to the country's GDP and population?"""

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

DATA ACCURACY & VERIFICATION (CRITICAL):
- TRIPLE-CHECK all market size figures - verify currency is USD, not local currency
- Validate market sizes against global benchmarks (e.g., India music streaming should be $1-5B, NOT $400B+)
- If you find conflicting data, cite multiple sources and explain the discrepancy
- Flag any numbers that seem unreasonable or require additional verification
- For market sizes over $10B, provide extra validation from 2-3 independent sources

COMPETITOR VALIDATION:
- Verify that all competitors mentioned are actually operating in {target_country}
- Cross-reference competitor information with multiple reliable sources
- Only include market share data that is verified from credible sources
- Distinguish between local {target_country} competitors and international brands with {target_country} operations

ENHANCED ENTRY COMPLEXITY ANALYSIS:
- Provide detailed cost breakdowns for each regulatory requirement
- Include specific timelines for each step of the business establishment process
- Research actual case studies of foreign companies entering {target_country} in the {industry} sector
- Analyze failed market entry attempts and their root causes
- Detail the complete supply chain setup process and costs
- Research local partnership requirements and typical partnership structures
- Analyze technology infrastructure requirements and integration challenges
- Research local talent availability and recruitment challenges
- Detail currency exchange risks and mitigation strategies
- Analyze local banking relationships and financial infrastructure needs

MARKET ENTRY CASE STUDIES:
- Analyze 3-5 case studies of similar companies that entered {target_country} in the {industry} sector
- Identify specific regulatory changes or market trends in {target_country} in past 12 months
- Research local consumer behavior patterns and preferences specific to {target_country}
- Analyze supply chain and distribution partnerships available in {target_country}
- Investigate potential acquisition targets or joint venture opportunities in {target_country}
- Assess technology adoption rates and digital transformation trends in {target_country}
- Research government incentives or support programs for foreign investors in {target_country}

CULTURAL AND OPERATIONAL INSIGHTS:
- Research local business practices and relationship-building requirements
- Analyze seasonal and cultural considerations affecting business operations in {target_country}
- Detail local media landscape and advertising regulations
- Research local consumer preferences and purchasing behaviors
- Analyze local competition dynamics and market positioning strategies

Provide maximum detail with specific data points, company examples, and quantitative analysis to enable precise scoring and strategic decision-making. Ensure all competitor information is verified and all complexity factors are specific to {target_country}."""
        
        report = await self.deep_researcher.run(deep_query)
        return report
    
    async def generate_competitor_report(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None, output_file: Optional[str] = None) -> str:
        """Generate a structured competitor analysis report as a JSON list of competitors with name, description, and approx market share."""
        task_description = f"""You are an expert market analyst specializing in {target_country}. 

CRITICAL REQUIREMENTS:
1. ONLY list competitors that are CURRENTLY OPERATING in {target_country}
2. Do NOT include competitors from {company}'s home market or other countries unless they have established operations in {target_country}
3. ONLY include verified market share data from reliable sources - if uncertain, use "unknown"
4. Focus on competitors that directly compete with {company} in the {industry} industry in {target_country}

List the top 5-10 direct competitors for {company} in the {industry} industry in {target_country}. For each competitor, provide exactly these fields: 
- 'name' (Company name that is verified to operate in {target_country})
- 'description' (1-2 sentence description of what they do in {target_country}, their positioning, any notable facts about their {target_country} operations)
- 'market_share' (Approximate market share as a percentage ONLY if verified from reliable sources, otherwise use 'unknown')
- 'years_in_market' (Number of years operating in {target_country}, use 'unknown' if not certain)
- 'headquarters' (Where the company is headquartered - this helps verify if they're actually operating in {target_country})"""
        
        example_format = """Example format:
[
  {"name": "Local Competitor A", "description": "Leading provider of X services in {target_country} with strong brand recognition and 50+ locations", "market_share": "25%", "years_in_market": "15", "headquarters": "{target_country}"},
  {"name": "International Brand B", "description": "Global company with established operations in {target_country}, focusing on premium segment", "market_share": "15%", "years_in_market": "8", "headquarters": "International"},
  {"name": "Local Competitor C", "description": "Established player with extensive distribution network in {target_country}", "market_share": "unknown", "years_in_market": "12", "headquarters": "{target_country}"}
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
                    "name": "Sample Local Competitor 1",
                    "description": "A major player in the {target_country} market with established presence",
                    "market_share": "unknown",
                    "years_in_market": "unknown",
                    "headquarters": "{target_country}"
                },
                {
                    "name": "Sample Local Competitor 2", 
                    "description": "Emerging competitor with innovative approach in {target_country}",
                    "market_share": "unknown",
                    "years_in_market": "unknown",
                    "headquarters": "{target_country}"
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
                required_fields = ['name', 'description', 'market_share', 'years_in_market', 'headquarters']
                for field in required_fields:
                    if field not in competitor:
                        raise ValueError(f"Competitor {i} missing '{field}' field")
            
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
        task_description = f"""You are an expert market strategist specializing in segment arbitrage in {target_country}. Analyze {company} in the {industry} industry expanding from their home market to {target_country}.

CRITICAL REQUIREMENTS:
1. Focus ONLY on segments that are underserved in {target_country}
2. Analyze gaps based on competitors that are CURRENTLY OPERATING in {target_country}
3. Do NOT reference competitors from {company}'s home market unless they have established operations in {target_country}
4. Ensure all market size estimates are specific to {target_country}

For each segment opportunity, provide exactly these fields:
- "segment_name": Name of the underserved segment in {target_country}
- "current_gap": Description of how this segment is currently underserved in {target_country}
- "positioning_opportunity": How the company can position itself to capture this segment in {target_country}
- "market_size": Estimated size of this segment opportunity in {target_country}
- "competitive_advantage": Why the company has an advantage in serving this segment in {target_country}
- "implementation_strategy": Specific steps to capture this segment in {target_country}

Focus on segments that are:
1. Underserved in {target_country} specifically
2. Align with the company's capabilities
3. Have significant market potential in {target_country}
4. Can be captured with the company's current positioning or slight modifications
5. Are not well-served by existing competitors in {target_country}"""

        example_format = """Example format:
[
  {
    "segment_name": "Premium Health-Conscious Consumers in {target_country}",
    "current_gap": "Limited premium healthy options in the {target_country} market",
    "positioning_opportunity": "Position as the premium healthy alternative with transparent sourcing in {target_country}",
    "market_size": "15-20% of {target_country} target market",
    "competitive_advantage": "Strong brand reputation for quality and transparency",
    "implementation_strategy": "Launch premium product line with health-focused marketing in {target_country}"
  },
  {
    "segment_name": "Digital-Native Millennials in {target_country}",
    "current_gap": "Lack of tech-integrated experiences in traditional offerings in {target_country}",
    "positioning_opportunity": "Create seamless digital-first customer experience in {target_country}",
    "market_size": "25-30% of {target_country} target market",
    "competitive_advantage": "Digital expertise and mobile-first approach",
    "implementation_strategy": "Develop mobile app and digital loyalty program for {target_country} market"
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
                    "segment_name": "Premium Segment in {target_country}",
                    "current_gap": "Limited premium options in the {target_country} market",
                    "positioning_opportunity": "Position as the premium alternative in {target_country}",
                    "market_size": "10-15% of {target_country} target market",
                    "competitive_advantage": "Strong brand reputation",
                    "implementation_strategy": "Launch premium product line in {target_country}"
                },
                {
                    "segment_name": "Digital-First Consumers in {target_country}",
                    "current_gap": "Lack of digital integration in {target_country}",
                    "positioning_opportunity": "Create seamless digital experience in {target_country}",
                    "market_size": "20-25% of {target_country} target market",
                    "competitive_advantage": "Digital expertise",
                    "implementation_strategy": "Develop mobile app and digital features for {target_country}"
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