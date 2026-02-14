from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
import asyncio
import logging
import json
from datetime import datetime
from typing import Dict

from .models import MarketReport, MultiMarketReport
from apps.accounts.permissions import HasAnalysisQuota

logger = logging.getLogger(__name__)


class MultiMarketAnalysisView(APIView):
    """Run analysis for 2-5 markets in parallel and return comparison."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            company_name = request.data.get('company_name')
            industry = request.data.get('industry')
            target_markets = request.data.get('target_markets', [])

            if not company_name or not industry:
                return Response({'error': 'company_name and industry are required'}, status=status.HTTP_400_BAD_REQUEST)
            if not isinstance(target_markets, list) or len(target_markets) < 2 or len(target_markets) > 5:
                return Response({'error': 'target_markets must be a list of 2-5 markets'}, status=status.HTTP_400_BAD_REQUEST)

            company_info = {
                'company_name': company_name,
                'industry': industry,
                'website': request.data.get('website', ''),
                'current_positioning': request.data.get('current_positioning', ''),
                'brand_description': request.data.get('brand_description', ''),
                'customer_segment': request.data.get('customer_segment', ''),
                'company_size': request.data.get('company_size', ''),
                'annual_revenue': request.data.get('annual_revenue', ''),
                'key_products': request.data.get('key_products', ''),
                'competitive_advantage': request.data.get('competitive_advantage', ''),
            }

            from apps.ai_agents.research_agent import CompetitorResearchAgent
            from apps.ai_agents.scoring_agent import MarketScoringAgent

            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            research_agent = CompetitorResearchAgent(cycles='3')
            scoring_agent = MarketScoringAgent()

            # Run research for all markets in parallel
            research_tasks = [
                research_agent.research_market(
                    company=company_name,
                    industry=industry,
                    target_country=market,
                    company_info={**company_info, 'target_market': market}
                )
                for market in target_markets
            ]

            research_results = loop.run_until_complete(asyncio.gather(*research_tasks))

            # Score each market
            all_scores = []
            individual_reports = []
            for i, (market, research) in enumerate(zip(target_markets, research_results)):
                info = {**company_info, 'target_market': market}
                scores = scoring_agent.score_research_report(research, info)
                scores['market_name'] = market
                all_scores.append(scores)

                # Create individual MarketReport
                analysis_id = f"MULTI_{company_name}_{market}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}"
                readiness = self._calculate_readiness(scores)
                report = MarketReport.objects.create(
                    analysis_id=analysis_id,
                    user=request.user,
                    analysis_type='standard',
                    status='completed',
                    company_name=company_name,
                    industry=industry,
                    target_market=market,
                    dashboard_data={
                        'market_opportunity_score': scores.get('market_opportunity_score', 5),
                        'competitive_intensity': scores.get('competitive_intensity', 'Medium'),
                        'competitive_intensity_score': scores.get('competitive_intensity_score', 5),
                        'entry_complexity_score': scores.get('entry_complexity_score', 5),
                        'revenue_potential': scores.get('revenue_potential_y1', 'N/A'),
                        'market_entry_readiness': readiness,
                    },
                    detailed_scores=scores,
                    research_report=research,
                    revenue_projections={
                        'year_1': scores.get('revenue_potential_y1', 'N/A'),
                        'year_3': scores.get('revenue_potential_y3', 'N/A'),
                    },
                    completed_at=datetime.now()
                )
                individual_reports.append(report)

            # Generate comparison
            comparison = scoring_agent.generate_comparison_summary(all_scores)

            # Save MultiMarketReport
            multi_report = MultiMarketReport.objects.create(
                user=request.user,
                company_name=company_name,
                industry=industry,
                target_markets=target_markets,
                comparison_matrix=comparison,
                ranking=comparison.get('ranked_markets', []),
                status='completed',
            )
            multi_report.individual_reports.set(individual_reports)

            return Response({
                'id': multi_report.id,
                'company_name': company_name,
                'target_markets': target_markets,
                'comparison': comparison,
                'individual_scores': [
                    {
                        'market': s.get('market_name', ''),
                        'market_opportunity_score': s.get('market_opportunity_score', 0),
                        'competitive_intensity': s.get('competitive_intensity', 'Medium'),
                        'competitive_intensity_score': s.get('competitive_intensity_score', 0),
                        'entry_complexity_score': s.get('entry_complexity_score', 0),
                        'revenue_potential_y1': s.get('revenue_potential_y1', 'N/A'),
                        'revenue_potential_y3': s.get('revenue_potential_y3', 'N/A'),
                        'overall_attractiveness': s.get('overall_attractiveness', 0),
                    }
                    for s in all_scores
                ],
                'status': 'completed',
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in multi-market analysis: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _calculate_readiness(self, scores):
        try:
            m = scores.get('market_opportunity_score', 5.0)
            c = scores.get('competitive_intensity_score', 5.0)
            x = scores.get('entry_complexity_score', 5.0)
            return min(100, max(0, int(((m * 0.4) + ((10 - c) * 0.3) + ((10 - x) * 0.3)) * 10)))
        except:
            return 50


class ScenarioModelView(APIView):
    """Re-score a report with modified assumptions."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            report_id = request.data.get('report_id')
            variable_changes = request.data.get('variable_changes', {})

            if not report_id:
                return Response({'error': 'report_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            report = MarketReport.objects.filter(id=report_id, user=request.user).first()
            if not report:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

            from apps.ai_agents.scoring_agent import MarketScoringAgent
            scoring_agent = MarketScoringAgent()

            original_scores = report.detailed_scores or {}

            # Modify assumptions based on variable_changes
            modified_context = f"""
Original analysis for {report.company_name} entering {report.target_market} ({report.industry}).

Original Scores:
- Market Opportunity: {original_scores.get('market_opportunity_score', 'N/A')}/10
- Competitive Intensity: {original_scores.get('competitive_intensity_score', 'N/A')}/10
- Entry Complexity: {original_scores.get('entry_complexity_score', 'N/A')}/10

The user wants to model a scenario with these changes:
"""
            for key, value in variable_changes.items():
                modified_context += f"- {key}: {value}\n"

            modified_context += """
Re-evaluate the scores considering these changes. Provide updated scores reflecting the scenario adjustments.
"""
            # Use scoring agent to re-score
            adjusted_scores = scoring_agent.score_research_report(modified_context, {
                'company_name': report.company_name,
                'industry': report.industry,
                'target_market': report.target_market,
            })

            # Calculate deltas
            deltas = {}
            for key in ['market_opportunity_score', 'competitive_intensity_score', 'entry_complexity_score']:
                orig = original_scores.get(key, 5.0)
                adj = adjusted_scores.get(key, 5.0)
                try:
                    deltas[key] = round(float(adj) - float(orig), 1)
                except (ValueError, TypeError):
                    deltas[key] = 0

            return Response({
                'report_id': report_id,
                'original_scores': {
                    'market_opportunity_score': original_scores.get('market_opportunity_score', 5.0),
                    'competitive_intensity_score': original_scores.get('competitive_intensity_score', 5.0),
                    'entry_complexity_score': original_scores.get('entry_complexity_score', 5.0),
                    'revenue_potential_y1': original_scores.get('revenue_potential_y1', 'N/A'),
                    'revenue_potential_y3': original_scores.get('revenue_potential_y3', 'N/A'),
                },
                'adjusted_scores': {
                    'market_opportunity_score': adjusted_scores.get('market_opportunity_score', 5.0),
                    'competitive_intensity_score': adjusted_scores.get('competitive_intensity_score', 5.0),
                    'entry_complexity_score': adjusted_scores.get('entry_complexity_score', 5.0),
                    'revenue_potential_y1': adjusted_scores.get('revenue_potential_y1', 'N/A'),
                    'revenue_potential_y3': adjusted_scores.get('revenue_potential_y3', 'N/A'),
                },
                'deltas': deltas,
                'variable_changes': variable_changes,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in scenario modeling: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeepDiveView(APIView):
    """Run a specific deep-dive research module on an existing report."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            report_id = request.data.get('report_id')
            module = request.data.get('module')

            if not report_id or not module:
                return Response({'error': 'report_id and module are required'}, status=status.HTTP_400_BAD_REQUEST)

            valid_modules = ['regulatory', 'cultural', 'talent', 'partners']
            if module not in valid_modules:
                return Response({'error': f'module must be one of: {", ".join(valid_modules)}'}, status=status.HTTP_400_BAD_REQUEST)

            report = MarketReport.objects.filter(id=report_id, user=request.user).first()
            if not report:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

            from apps.ai_agents.research_agent import CompetitorResearchAgent

            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            research_agent = CompetitorResearchAgent(cycles='3')
            result = loop.run_until_complete(
                research_agent.research_deep_dive(
                    company=report.company_name,
                    industry=report.industry,
                    target_country=report.target_market,
                    module=module,
                    company_info={
                        'company_name': report.company_name,
                        'industry': report.industry,
                        'target_market': report.target_market,
                    }
                )
            )

            # Save to report's deep_dives field
            deep_dives = report.deep_dives or {}
            deep_dives[module] = result
            report.deep_dives = deep_dives
            report.save(update_fields=['deep_dives'])

            return Response({
                'report_id': report_id,
                'module': module,
                'result': result,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in deep dive: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FinancialModelView(APIView):
    """Generate financial modeling data (sensitivity + scenarios) for a report."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, report_id):
        try:
            report = MarketReport.objects.filter(id=report_id, user=request.user).first()
            if not report:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

            from apps.ai_agents.financial_agent import FinancialModelingAgent
            agent = FinancialModelingAgent()

            report_data = {
                'company_name': report.company_name,
                'industry': report.industry,
                'target_market': report.target_market,
                'dashboard_data': report.dashboard_data,
                'revenue_projections': report.revenue_projections,
                'detailed_scores': report.detailed_scores,
            }

            sensitivity = agent.generate_sensitivity_analysis(report_data)
            scenarios = agent.generate_scenario_projections(report_data)

            return Response({
                'report_id': report_id,
                'sensitivity_analysis': sensitivity,
                'scenario_projections': scenarios,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in financial model: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlaybookView(APIView):
    """Generate a market entry playbook for an existing report."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, report_id):
        try:
            report = MarketReport.objects.filter(id=report_id, user=request.user).first()
            if not report:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

            # If playbook already exists and force is not set, return existing
            if report.playbook and not request.data.get('force', False):
                return Response({
                    'report_id': report_id,
                    'playbook': report.playbook,
                    'cached': True,
                }, status=status.HTTP_200_OK)

            from apps.ai_agents.research_agent import CompetitorResearchAgent

            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            research_agent = CompetitorResearchAgent(cycles='3')

            report_data = {
                'company_name': report.company_name,
                'industry': report.industry,
                'target_market': report.target_market,
                'dashboard_data': report.dashboard_data,
                'detailed_scores': report.detailed_scores,
                'revenue_projections': report.revenue_projections,
            }

            playbook = loop.run_until_complete(
                research_agent.generate_market_entry_playbook(report_data)
            )

            # Save to report
            report.playbook = playbook
            report.save(update_fields=['playbook'])

            return Response({
                'report_id': report_id,
                'playbook': playbook,
                'cached': False,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error generating playbook: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, report_id):
        """Get existing playbook for a report."""
        report = MarketReport.objects.filter(id=report_id, user=request.user).first()
        if not report:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        if not report.playbook:
            return Response(
                {'error': 'No playbook generated for this report. Use POST to generate one.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'report_id': report_id,
            'playbook': report.playbook,
        }, status=status.HTTP_200_OK)


class MultiMarketReportListView(APIView):
    """List user's multi-market comparison reports."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reports = MultiMarketReport.objects.filter(user=request.user)
        data = [
            {
                'id': r.id,
                'company_name': r.company_name,
                'industry': r.industry,
                'target_markets': r.target_markets,
                'status': r.status,
                'created_at': r.created_at.isoformat(),
            }
            for r in reports
        ]
        return Response(data, status=status.HTTP_200_OK)
