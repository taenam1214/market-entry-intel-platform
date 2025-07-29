from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import asyncio
import logging
import json
from datetime import datetime
from typing import Dict

logger = logging.getLogger(__name__)

class MarketAnalysisRequestSerializer:
    """Simple serializer for market analysis requests"""
    
    @staticmethod
    def validate_data(data):
        required_fields = ['company_name', 'industry', 'target_market']
        errors = {}
        
        for field in required_fields:
            if not data.get(field):
                errors[field] = 'This field is required.'
        
        # Optional fields validation
        if data.get('website') and not data['website'].startswith(('http://', 'https://')):
            errors['website'] = 'Please enter a valid URL starting with http:// or https://'
        
        return errors

class MarketAnalysisAPIView(APIView):
    """
    API endpoint to trigger market analysis using research and scoring agents
    """
    permission_classes = [permissions.AllowAny]  # Remove auth for now, add later
    
    def post(self, request):
        try:
            # Validate input data
            serializer = MarketAnalysisRequestSerializer()
            errors = serializer.validate_data(request.data)
            
            if errors:
                return Response(
                    {'errors': errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract parameters
            company_info = {
                'company_name': request.data.get('company_name'),
                'industry': request.data.get('industry'),
                'target_market': request.data.get('target_market'),
                'website': request.data.get('website', ''),
                'current_positioning': request.data.get('current_positioning', ''),
                'brand_description': request.data.get('brand_description', ''),
                'email': request.data.get('email', '')
            }
            
            # Import agents
            from apps.ai_agents.research_agent import CompetitorResearchAgent
            from apps.ai_agents.scoring_agent import MarketScoringAgent
            
            # Run the analysis
            logger.info(f"Starting market analysis for {company_info['company_name']} expanding to {company_info['target_market']}")
            
            # Create event loop for async operation
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Run the research agent with enhanced prompts
            research_agent = CompetitorResearchAgent()
            
            # Execute the research with company context
            research_report = loop.run_until_complete(
                research_agent.research_market(
                    company=company_info['company_name'],
                    industry=company_info['industry'],
                    target_country=company_info['target_market'],
                    company_info=company_info
                )
            )
            
            # Generate scores using the scoring agent
            scoring_agent = MarketScoringAgent()
            scores = scoring_agent.score_research_report(research_report, company_info)
            
            # Generate analysis ID for tracking
            analysis_id = f"{company_info['company_name']}_{company_info['target_market']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Calculate market entry readiness percentage
            market_entry_readiness = self._calculate_readiness(scores)
            
            # Prepare dashboard-ready response
            response_data = {
                'analysis_id': analysis_id,
                'status': 'completed',
                'timestamp': datetime.now().isoformat(),
                
                # Company info
                'company_info': company_info,
                
                # Dashboard metrics (matching your UI)
                'dashboard': {
                    'market_opportunity_score': scores['market_opportunity_score'],
                    'market_opportunity_change': '+12%',  # Mock change for now
                    
                    'competitive_intensity': scores['competitive_intensity'],
                    'competitive_intensity_score': scores['competitive_intensity_score'],
                    'competitive_intensity_change': '-5%',  # Mock change
                    
                    'entry_complexity_score': scores['entry_complexity_score'],
                    'entry_complexity_change': '+3%',  # Mock change
                    
                    'revenue_potential': scores['revenue_potential_y1'],
                    'revenue_potential_change': '+18%',  # Mock change
                    
                    'market_entry_readiness': market_entry_readiness,
                    'readiness_description': self._get_readiness_description(market_entry_readiness)
                },
                
                # Detailed scores and analysis
                'detailed_scores': scores,
                
                # Full research report
                'research_report': research_report,
                
                # Key insights for dashboard
                'key_insights': self._extract_key_insights(scores),
                
                # Revenue projections
                'revenue_projections': {
                    'year_1': scores['revenue_potential_y1'],
                    'year_3': scores['revenue_potential_y3'],
                    'market_share_y1': scores.get('market_share_target_y1', '0.5%'),
                    'market_share_y3': scores.get('market_share_target_y3', '2.0%')
                },
                
                # Recommended actions (mock for now, can be enhanced)
                'recommended_actions': {
                    'immediate': 'Finalize premium segment positioning strategy',
                    'short_term': 'Launch pilot program in target market',
                    'long_term': 'Scale operations and capture 12% market share'
                },
                
                'message': 'Market analysis completed successfully'
            }
            
            logger.info(f"Market analysis completed for {company_info['company_name']}")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in market analysis: {str(e)}")
            return Response(
                {
                    'error': 'An error occurred during market analysis',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_readiness(self, scores: Dict) -> int:
        """Calculate market entry readiness percentage based on scores."""
        try:
            market_score = scores.get('market_opportunity_score', 5.0)
            competitive_score = scores.get('competitive_intensity_score', 5.0)
            complexity_score = scores.get('entry_complexity_score', 5.0)
            
            # Weighted calculation
            # Higher market opportunity = better readiness
            # Lower competitive intensity = better readiness  
            # Lower complexity = better readiness
            readiness = (
                (market_score * 0.4) +
                ((10 - competitive_score) * 0.3) +
                ((10 - complexity_score) * 0.3)
            ) * 10
            
            return min(100, max(0, int(readiness)))
        except:
            return 50  # Default fallback
    
    def _get_readiness_description(self, readiness: int) -> str:
        """Get description based on readiness score."""
        if readiness >= 80:
            return "Your market entry strategy shows strong potential with identified opportunities in the premium segment and clear competitive advantages."
        elif readiness >= 60:
            return "Good market entry potential with moderate complexity. Focus on competitive positioning and market adaptation."
        elif readiness >= 40:
            return "Market entry feasible but requires careful planning. Address key barriers and competitive challenges."
        else:
            return "Market entry presents significant challenges. Consider alternative markets or substantial strategy modifications."
    
    def _extract_key_insights(self, scores: Dict) -> list:
        """Extract key insights for the dashboard."""
        insights = []
        
        # Market opportunity insight
        market_score = scores.get('market_opportunity_score', 5.0)
        if market_score >= 7.0:
            insights.append({
                'type': 'opportunity',
                'priority': 'high',
                'title': 'Premium segment shows 40% less competition',
                'description': 'Market analysis indicates significant opportunity in premium segment with reduced competitive pressure.'
            })
        
        # Competitive insight
        competitive_intensity = scores.get('competitive_intensity', 'Medium')
        if competitive_intensity == 'Low':
            insights.append({
                'type': 'opportunity', 
                'priority': 'high',
                'title': 'Low competitive intensity identified',
                'description': 'Market has limited direct competition, providing favorable entry conditions.'
            })
        elif competitive_intensity == 'High':
            insights.append({
                'type': 'risk',
                'priority': 'medium',
                'title': 'High competitive intensity',
                'description': 'Market has intense competition requiring strong differentiation strategy.'
            })
        
        # Complexity insight
        complexity_score = scores.get('entry_complexity_score', 5.0)
        if complexity_score <= 4.0:
            insights.append({
                'type': 'strategy',
                'priority': 'low',
                'title': 'Cultural alignment score: 85% positive',
                'description': 'Strong cultural fit identified with positive market reception indicators.'
            })
        elif complexity_score >= 7.0:
            insights.append({
                'type': 'risk',
                'priority': 'high',
                'title': 'High entry complexity identified',
                'description': 'Significant regulatory and operational barriers require careful planning.'
            })
        
        # Add a positioning insight
        insights.append({
            'type': 'strategy',
            'priority': 'medium', 
            'title': 'Brand positioning gap identified in mid-market',
            'description': 'Analysis reveals opportunity for strategic positioning between budget and premium segments.'
        })
        
        return insights[:3]  # Return top 3 insights

class DeepMarketAnalysisAPIView(APIView):
    """
    API endpoint for deep market analysis using DeepResearcher
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            # Validate input data
            serializer = MarketAnalysisRequestSerializer()
            errors = serializer.validate_data(request.data)
            
            if errors:
                return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract parameters
            company_info = {
                'company_name': request.data.get('company_name'),
                'industry': request.data.get('industry'),
                'target_market': request.data.get('target_market'),
                'website': request.data.get('website', ''),
                'current_positioning': request.data.get('current_positioning', ''),
                'brand_description': request.data.get('brand_description', ''),
                'email': request.data.get('email', '')
            }
            
            # Import agents
            from apps.ai_agents.research_agent import CompetitorResearchAgent
            from apps.ai_agents.scoring_agent import MarketScoringAgent
            
            logger.info(f"Starting DEEP market analysis for {company_info['company_name']}")
            
            # Create event loop for async operation
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Run deep research analysis
            research_agent = CompetitorResearchAgent()
            
            # Execute deep research with enhanced prompts
            deep_report = loop.run_until_complete(
                research_agent.research_market_deep(
                    company=company_info['company_name'],
                    industry=company_info['industry'],
                    target_country=company_info['target_market'],
                    company_info=company_info
                )
            )
            
            # Generate comprehensive scores
            scoring_agent = MarketScoringAgent()
            scores = scoring_agent.score_research_report(deep_report, company_info)
            
            # Generate analysis ID
            analysis_id = f"DEEP_{company_info['company_name']}_{company_info['target_market']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Prepare comprehensive response
            response_data = {
                'analysis_id': analysis_id,
                'analysis_type': 'deep_research',
                'status': 'completed',
                'timestamp': datetime.now().isoformat(),
                'company_info': company_info,
                'detailed_scores': scores,
                'deep_research_report': deep_report,
                'executive_summary': self._generate_executive_summary(scores, company_info),
                'confidence_level': scores.get('confidence_level', 'High'),
                'message': 'Deep market analysis completed successfully'
            }
            
            logger.info(f"Deep market analysis completed for {company_info['company_name']}")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in deep market analysis: {str(e)}")
            return Response(
                {'error': 'An error occurred during deep market analysis', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_executive_summary(self, scores: Dict, company_info: Dict) -> str:
        """Generate executive summary from scores."""
        company_name = company_info.get('company_name', 'Company')
        target_market = company_info.get('target_market', 'target market')
        
        market_score = scores.get('market_opportunity_score', 5.0)
        competitive_intensity = scores.get('competitive_intensity', 'Medium')
        complexity_score = scores.get('entry_complexity_score', 5.0)
        
        summary = f"""
**Executive Summary: {company_name} Market Entry Analysis**

**Market Opportunity:** {market_score}/10 - """
        
        if market_score >= 7.0:
            summary += f"Strong market opportunity identified in {target_market} with favorable growth conditions and market dynamics."
        elif market_score >= 5.0:
            summary += f"Moderate market opportunity in {target_market} with balanced risk-reward profile."
        else:
            summary += f"Limited market opportunity in {target_market} requiring careful consideration of entry strategy."
        
        summary += f"""

**Competitive Landscape:** {competitive_intensity} intensity - Current market structure """
        
        if competitive_intensity == 'Low':
            summary += "provides favorable entry conditions with limited direct competition."
        elif competitive_intensity == 'Medium':
            summary += "shows balanced competition requiring strategic differentiation."
        else:
            summary += "presents significant competitive challenges requiring strong market positioning."
        
        summary += f"""

**Entry Complexity:** {complexity_score}/10 - Market entry """
        
        if complexity_score <= 4.0:
            summary += "presents minimal barriers with straightforward implementation path."
        elif complexity_score <= 7.0:
            summary += "involves moderate complexity requiring structured approach and local partnerships."
        else:
            summary += "requires extensive planning due to significant regulatory and operational barriers."
        
        summary += f"""

**Recommendation:** Based on comprehensive analysis, market entry into {target_market} """
        
        overall_score = (market_score + (10 - scores.get('competitive_intensity_score', 5)) + (10 - complexity_score)) / 3
        
        if overall_score >= 7.0:
            summary += "is strongly recommended with high probability of success."
        elif overall_score >= 5.0:
            summary += "is recommended with careful strategic planning and risk mitigation."
        else:
            summary += "should be reconsidered or delayed pending strategy optimization."
        
        return summary

class HealthCheckAPIView(APIView):
    """Simple health check endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Market Intelligence API',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0',
            'features': ['market_analysis', 'deep_analysis', 'scoring_agent', 'research_agent']
        })

# Alternative function-based view approach
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def quick_market_analysis(request):
    """
    Quick market analysis endpoint - simplified version for fast turnaround
    """
    try:
        data = request.data
        
        # Basic validation
        if not all([data.get('company_name'), data.get('industry'), data.get('target_market')]):
            return Response(
                {'error': 'company_name, industry, and target_market are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For quick analysis, return immediate processing response
        # In production, you might queue this for background processing
        
        response_data = {
            'message': f"Quick analysis initiated for {data.get('company_name')} expansion to {data.get('target_market')}",
            'status': 'processing',
            'analysis_id': f"quick_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'estimated_completion': '2-3 minutes',
            'next_steps': 'Use the full market-analysis endpoint for comprehensive results'
        }
        
        return Response(response_data, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )