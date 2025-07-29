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
        """Generate a comprehensive competitor analysis report optimized for scoring."""
        report = await self.research_market(company, industry, target_country, company_info)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"Competitor expansion report saved to: {output_file}")
        
        return report
    
    async def generate_deep_competitor_analysis(self, company: str, industry: str, target_country: str, company_info: Dict[str, Any] = None, output_file: Optional[str] = None) -> str:
        """Generate a deep competitor analysis using enhanced prompts for comprehensive scoring data."""
        report = await self.research_market_deep(company, industry, target_country, company_info)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"Deep expansion analysis saved to: {output_file}")
        
        return report