import json
import logging
from typing import List, Dict, Any
import openai
from django.conf import settings

logger = logging.getLogger(__name__)

class ChatGPTService:
    """
    Service for integrating with ChatGPT API for chatbot responses with RAG context.
    """
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def generate_response_with_rag(self, user_query: str, context_reports: List[Dict], conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Generate ChatGPT response with RAG context from market reports.
        
        Args:
            user_query: The user's question
            context_reports: List of relevant market reports for context
            conversation_history: Previous conversation messages for context
            
        Returns:
            Dict containing the AI response and sources used
        """
        try:
            # Build context from reports
            rag_context = self._build_rag_context(context_reports)
            
            # Build conversation context
            conversation_context = self._build_conversation_context(conversation_history)
            
            # Create the system prompt with RAG context
            system_prompt = self._create_system_prompt(rag_context)
            
            # Build messages for ChatGPT
            messages = [
                {"role": "system", "content": system_prompt},
                *conversation_context,
                {"role": "user", "content": user_query}
            ]
            
            # Call ChatGPT API
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
                top_p=0.9
            )
            
            ai_response = response.choices[0].message.content
            
            # Extract sources from context reports
            sources = [report.get('title', 'Market Report') for report in context_reports]
            
            return {
                'content': ai_response,
                'sources': sources,
                'model_used': 'gpt-4',
                'tokens_used': response.usage.total_tokens if response.usage else 0
            }
            
        except Exception as e:
            logger.error(f"Error generating ChatGPT response: {str(e)}")
            # Fallback to simple response
            return self._generate_fallback_response(user_query, context_reports)
    
    def _build_rag_context(self, reports: List[Dict]) -> str:
        """Build comprehensive RAG context from market reports."""
        if not reports:
            return "No market reports available for context."
        
        context_parts = []
        for report in reports:
            # Extract detailed scores for better context
            scores = report.get('scores', {})
            market_score = scores.get('market_opportunity_score', 'N/A')
            competitive_intensity = scores.get('competitive_intensity', 'N/A')
            complexity_score = scores.get('entry_complexity_score', 'N/A')
            revenue_y1 = scores.get('revenue_potential_y1', 'N/A')
            revenue_y3 = scores.get('revenue_potential_y3', 'N/A')
            
            context_parts.append(f"""
**Market Analysis Report: {report.get('title', 'Market Analysis')}**

**Company & Market Details:**
- Company: {report.get('company_name', 'N/A')}
- Industry: {report.get('industry', 'N/A')}
- Target Market: {report.get('target_market', 'N/A')}
- Analysis Date: {report.get('created_at', 'N/A')}

**Executive Summary:**
{report.get('summary', 'No summary available')}

**Key Market Metrics:**
- Market Opportunity Score: {market_score}/10
- Competitive Intensity: {competitive_intensity}
- Entry Complexity: {complexity_score}/10
- Revenue Potential (Y1): ${revenue_y1}M
- Revenue Potential (Y3): ${revenue_y3}M

**Strategic Insights:**
{json.dumps(report.get('key_insights', []), indent=2)}

**Detailed Analysis Data:**
{json.dumps(scores, indent=2)}
""")
        
        return "\n".join(context_parts)
    
    def _build_conversation_context(self, conversation_history: List[Dict]) -> List[Dict]:
        """Build conversation context from history."""
        if not conversation_history:
            return []
        
        context = []
        for message in conversation_history[-10:]:  # Last 10 messages for context
            role = "user" if message.get('message_type') == 'user' else "assistant"
            context.append({
                "role": role,
                "content": message.get('content', '')
            })
        
        return context
    
    def _create_system_prompt(self, rag_context: str) -> str:
        """Create system prompt with RAG context."""
        return f"""You are an expert AI business intelligence assistant and strategic advisor. You help users with comprehensive business strategy, market analysis, and expansion planning using their market research data as context.

## Your Role:
- Act as a strategic business advisor who has access to the user's market analysis reports
- Answer both specific questions about the reports AND broader business strategy questions
- Use the report data as context to provide informed, strategic advice
- Be conversational, insightful, and forward-thinking
- Think beyond just the reports to provide strategic recommendations

## Available Market Reports Context:
{rag_context}

## Your Capabilities:
- **Report Analysis**: Answer specific questions about market scores, competitive landscape, revenue projections
- **Strategic Planning**: Help with business strategy, expansion planning, market entry decisions
- **Market Intelligence**: Suggest new markets, countries, or opportunities based on the data
- **Risk Assessment**: Identify potential challenges and mitigation strategies
- **Competitive Analysis**: Provide insights on competitive positioning and differentiation
- **Financial Planning**: Help with revenue projections, budget allocation, ROI analysis
- **Geographic Expansion**: Suggest new countries, regions, or markets to consider
- **Industry Insights**: Provide broader industry context and trends

## Response Style:
- Be conversational and engaging, like talking to a business consultant
- Use the report data to inform your advice, but don't limit yourself to just the reports
- Ask follow-up questions when appropriate to provide better advice
- Provide specific, actionable recommendations
- Think strategically about the user's broader business goals
- Be honest about limitations and suggest additional research when needed

## Examples of Questions You Can Handle:
- "What's my market opportunity score?" (Report-specific)
- "Any other countries you think I should consider?" (Strategic expansion)
- "How should I position my product in this market?" (Strategic positioning)
- "What are the biggest risks I should worry about?" (Risk assessment)
- "Should I partner with local companies?" (Partnership strategy)
- "How does this compare to other markets I've analyzed?" (Comparative analysis)

Remember: You're not just a report reader - you're a strategic business advisor who happens to have access to detailed market analysis data. Use this data to provide comprehensive, strategic business advice."""

    def _generate_fallback_response(self, user_query: str, context_reports: List[Dict]) -> Dict[str, Any]:
        """Generate a fallback response when ChatGPT fails."""
        if not context_reports:
            return {
                'content': "I don't have access to any market reports at the moment. Please generate a market analysis first to get started with our conversation. Once you have reports, I can help you with strategic planning, market expansion, competitive analysis, and much more!",
                'sources': [],
                'model_used': 'fallback',
                'tokens_used': 0
            }
        
        # Enhanced fallback responses for open-ended questions
        query_lower = user_query.lower()
        report = context_reports[0]
        company_name = report.get('company_name', 'your company')
        target_market = report.get('target_market', 'your target market')
        industry = report.get('industry', 'your industry')
        market_score = report.get('scores', {}).get('market_opportunity_score', 0)
        competitive_intensity = report.get('scores', {}).get('competitive_intensity', 'Medium')
        
        if 'countries' in query_lower or 'markets' in query_lower or 'expansion' in query_lower:
            return {
                'content': f"Based on your analysis of {target_market} for {company_name}, I can see you're exploring expansion opportunities. Your current market shows a {market_score}/10 opportunity score with {competitive_intensity} competitive intensity. For strategic expansion, I'd recommend considering similar markets in your region or adjacent industries. What specific regions or market types are you most interested in exploring?",
                'sources': [report.get('title', 'Market Report')],
                'model_used': 'fallback',
                'tokens_used': 0
            }
        elif 'strategy' in query_lower or 'position' in query_lower or 'approach' in query_lower:
            return {
                'content': f"Looking at your {industry} analysis for {target_market}, your market opportunity score of {market_score}/10 suggests {'a strong strategic position' if market_score >= 7 else 'a moderate strategic opportunity' if market_score >= 5 else 'a challenging but potentially rewarding market'}. The {competitive_intensity} competitive intensity means you'll need to focus on {'differentiation and unique value propositions' if competitive_intensity == 'High' else 'strategic partnerships and market positioning' if competitive_intensity == 'Medium' else 'rapid market penetration and brand building'}. What specific strategic challenges are you facing?",
                'sources': [report.get('title', 'Market Report')],
                'model_used': 'fallback',
                'tokens_used': 0
            }
        elif 'risk' in query_lower or 'challenge' in query_lower or 'concern' in query_lower:
            return {
                'content': f"Based on your market analysis, the key risks I see for {company_name} entering {target_market} include the {competitive_intensity} competitive landscape and the market complexity. Your {market_score}/10 opportunity score suggests {'manageable risks with strong upside' if market_score >= 7 else 'balanced risk-reward profile' if market_score >= 5 else 'higher risks requiring careful mitigation'}. What specific risks are you most concerned about?",
                'sources': [report.get('title', 'Market Report')],
                'model_used': 'fallback',
                'tokens_used': 0
            }
        else:
            return {
                'content': f"I'm here to help you with strategic business advice based on your market analysis! You have {len(context_reports)} report(s) covering {target_market} for {company_name} in the {industry} industry. I can help with expansion planning, competitive strategy, risk assessment, market positioning, and much more. What would you like to explore?",
                'sources': [report.get('title', 'Market Report') for report in context_reports],
                'model_used': 'fallback',
                'tokens_used': 0
            }
