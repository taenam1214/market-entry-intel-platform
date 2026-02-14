from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count
import logging

from .models import MarketReport

logger = logging.getLogger(__name__)


def _percentile(values, p):
    """Calculate the p-th percentile of a sorted list of values."""
    if not values:
        return None
    k = (len(values) - 1) * (p / 100.0)
    f = int(k)
    c = f + 1
    if c >= len(values):
        return values[f]
    return values[f] + (k - f) * (values[c] - values[f])


class BenchmarkView(APIView):
    """GET: Aggregated anonymized benchmark data across completed reports."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        industry = request.query_params.get('industry')
        market = request.query_params.get('market')
        report_id = request.query_params.get('report_id')

        qs = MarketReport.objects.filter(status='completed')

        if industry:
            qs = qs.filter(industry__icontains=industry)
        if market:
            qs = qs.filter(target_market__icontains=market)

        reports = qs.values_list('detailed_scores', flat=True)

        market_opp_scores = []
        competitive_scores = []
        complexity_scores = []

        for scores in reports:
            if not isinstance(scores, dict):
                continue
            mos = scores.get('market_opportunity_score')
            cis = scores.get('competitive_intensity_score')
            ecs = scores.get('entry_complexity_score')
            if mos is not None:
                try:
                    market_opp_scores.append(float(mos))
                except (ValueError, TypeError):
                    pass
            if cis is not None:
                try:
                    competitive_scores.append(float(cis))
                except (ValueError, TypeError):
                    pass
            if ecs is not None:
                try:
                    complexity_scores.append(float(ecs))
                except (ValueError, TypeError):
                    pass

        market_opp_scores.sort()
        competitive_scores.sort()
        complexity_scores.sort()

        benchmarks = {
            'total_reports': len(market_opp_scores),
            'market_opportunity_score': {
                'median': _percentile(market_opp_scores, 50),
                'p25': _percentile(market_opp_scores, 25),
                'p75': _percentile(market_opp_scores, 75),
            },
            'competitive_intensity_score': {
                'median': _percentile(competitive_scores, 50),
                'p25': _percentile(competitive_scores, 25),
                'p75': _percentile(competitive_scores, 75),
            },
            'entry_complexity_score': {
                'median': _percentile(complexity_scores, 50),
                'p25': _percentile(complexity_scores, 25),
                'p75': _percentile(complexity_scores, 75),
            },
        }

        if industry:
            benchmarks['industry_filter'] = industry
        if market:
            benchmarks['market_filter'] = market

        # Calculate user's percentile if report_id is provided
        if report_id:
            try:
                user_report = MarketReport.objects.get(
                    pk=report_id, user=request.user, status='completed'
                )
                user_scores = user_report.detailed_scores
                if isinstance(user_scores, dict):
                    user_percentiles = {}

                    user_mos = user_scores.get('market_opportunity_score')
                    if user_mos is not None and market_opp_scores:
                        try:
                            val = float(user_mos)
                            rank = sum(1 for s in market_opp_scores if s <= val)
                            user_percentiles['market_opportunity_score'] = round(
                                (rank / len(market_opp_scores)) * 100, 1
                            )
                        except (ValueError, TypeError):
                            pass

                    user_cis = user_scores.get('competitive_intensity_score')
                    if user_cis is not None and competitive_scores:
                        try:
                            val = float(user_cis)
                            rank = sum(1 for s in competitive_scores if s <= val)
                            user_percentiles['competitive_intensity_score'] = round(
                                (rank / len(competitive_scores)) * 100, 1
                            )
                        except (ValueError, TypeError):
                            pass

                    user_ecs = user_scores.get('entry_complexity_score')
                    if user_ecs is not None and complexity_scores:
                        try:
                            val = float(user_ecs)
                            rank = sum(1 for s in complexity_scores if s <= val)
                            user_percentiles['entry_complexity_score'] = round(
                                (rank / len(complexity_scores)) * 100, 1
                            )
                        except (ValueError, TypeError):
                            pass

                    benchmarks['user_percentiles'] = user_percentiles
            except MarketReport.DoesNotExist:
                benchmarks['user_percentiles_error'] = 'Report not found or not accessible.'

        return Response(benchmarks, status=status.HTTP_200_OK)
