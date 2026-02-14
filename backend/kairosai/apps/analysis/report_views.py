from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdminOrOwner
from .models import MarketReport
from .report_generator import (
    generate_executive_summary_pdf,
    generate_go_nogo_pdf,
    generate_investment_memo_pdf,
    generate_board_presentation_pptx,
)


REPORT_TYPES = {
    'executive-summary': {
        'generator': generate_executive_summary_pdf,
        'content_type': 'application/pdf',
        'extension': 'pdf',
        'min_tier': 'starter',
    },
    'go-nogo': {
        'generator': generate_go_nogo_pdf,
        'content_type': 'application/pdf',
        'extension': 'pdf',
        'min_tier': 'starter',
    },
    'investment-memo': {
        'generator': generate_investment_memo_pdf,
        'content_type': 'application/pdf',
        'extension': 'pdf',
        'min_tier': 'starter',
    },
    'board-presentation': {
        'generator': generate_board_presentation_pptx,
        'content_type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'extension': 'pptx',
        'min_tier': 'professional',
    },
}

TIER_ORDER = ['free', 'starter', 'professional', 'enterprise']


class DownloadReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id, report_type):
        if report_type not in REPORT_TYPES:
            return Response(
                {'error': f'Invalid report type. Valid types: {", ".join(REPORT_TYPES.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            report = MarketReport.objects.get(id=report_id)
        except MarketReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check ownership (admin can access any)
        if not request.user.is_admin and report.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        # Check tier
        config = REPORT_TYPES[report_type]
        min_tier = config['min_tier']
        user_tier = getattr(request.user, 'subscription_tier', 'free')

        if not request.user.is_admin:
            user_tier_index = TIER_ORDER.index(user_tier) if user_tier in TIER_ORDER else 0
            min_tier_index = TIER_ORDER.index(min_tier) if min_tier in TIER_ORDER else 0
            if user_tier_index < min_tier_index:
                return Response(
                    {'error': f'This report requires {min_tier} tier or higher. Current tier: {user_tier}'},
                    status=status.HTTP_403_FORBIDDEN
                )

        try:
            file_bytes = config['generator'](report)
        except ImportError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Report generation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        filename = f'{report.company_name}-{report_type}.{config["extension"]}'
        response = HttpResponse(file_bytes, content_type=config['content_type'])
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
