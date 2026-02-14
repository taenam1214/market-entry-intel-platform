from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import uuid
import logging

from .models import MarketReport
from apps.teams.models import TeamMember

logger = logging.getLogger(__name__)


class ShareReportView(APIView):
    """POST: Generate a shareable link for a report."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, report_id):
        try:
            report = MarketReport.objects.get(pk=report_id)
        except MarketReport.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check ownership or admin access
        if report.user != request.user and not request.user.is_admin:
            return Response(
                {'error': 'You do not have permission to share this report.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if report.is_shared and report.share_token:
            share_url = f"{settings.FRONTEND_URL}/shared/{report.share_token}"
            return Response({
                'share_token': report.share_token,
                'share_url': share_url,
                'message': 'Report is already shared.',
            })

        token = uuid.uuid4().hex
        report.share_token = token
        report.is_shared = True
        report.save(update_fields=['share_token', 'is_shared', 'updated_at'])

        share_url = f"{settings.FRONTEND_URL}/shared/{token}"

        return Response({
            'share_token': token,
            'share_url': share_url,
            'message': 'Report shared successfully.',
        }, status=status.HTTP_200_OK)


class UnshareReportView(APIView):
    """POST: Remove shareable link for a report."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, report_id):
        try:
            report = MarketReport.objects.get(pk=report_id)
        except MarketReport.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if report.user != request.user and not request.user.is_admin:
            return Response(
                {'error': 'You do not have permission to unshare this report.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        report.share_token = None
        report.is_shared = False
        report.save(update_fields=['share_token', 'is_shared', 'updated_at'])

        return Response({
            'message': 'Report unshared successfully.',
        }, status=status.HTTP_200_OK)


class SharedReportView(APIView):
    """GET: View a shared report (no auth required)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, share_token):
        try:
            report = MarketReport.objects.get(share_token=share_token, is_shared=True)
        except MarketReport.DoesNotExist:
            return Response(
                {'error': 'Shared report not found or link has been revoked.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'company_name': report.company_name,
            'industry': report.industry,
            'target_market': report.target_market,
            'analysis_type': report.analysis_type,
            'status': report.status,
            'dashboard_data': report.dashboard_data,
            'competitor_analysis': report.competitor_analysis,
            'segment_arbitrage': report.segment_arbitrage,
            'revenue_projections': report.revenue_projections,
            'key_insights': report.key_insights,
            'recommended_actions': report.recommended_actions,
            'created_at': report.created_at.isoformat(),
        }, status=status.HTTP_200_OK)
