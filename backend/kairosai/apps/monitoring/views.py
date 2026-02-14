import logging
from datetime import date, datetime

from django.db import IntegrityError
from django.db.models import Count, Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analysis.models import MarketReport
from .models import (
    MarketMonitor,
    MarketAlert,
    ExecutionPlan,
    Milestone,
    CompetitorTracker,
    CompetitorUpdate,
)

logger = logging.getLogger(__name__)


class MonitorListCreateView(APIView):
    """GET: List user's monitors. POST: Create a monitor for a report."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        monitors = (
            MarketMonitor.objects
            .filter(user=request.user)
            .select_related('report')
            .annotate(
                alert_count=Count('alerts'),
                unread_alert_count=Count('alerts', filter=Q(alerts__is_read=False)),
            )
        )
        data = [
            {
                'id': m.id,
                'report_id': m.report_id,
                'company_name': m.report.company_name,
                'target_market': m.report.target_market,
                'industry': m.report.industry,
                'is_active': m.is_active,
                'frequency': m.frequency,
                'last_checked': m.last_checked.isoformat() if m.last_checked else None,
                'alert_count': m.alert_count,
                'unread_alert_count': m.unread_alert_count,
                'created_at': m.created_at.isoformat(),
            }
            for m in monitors
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        report_id = request.data.get('report_id')
        frequency = request.data.get('frequency', 'weekly')

        if not report_id:
            return Response(
                {'error': 'report_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_frequencies = [choice[0] for choice in MarketMonitor.FREQUENCY_CHOICES]
        if frequency not in valid_frequencies:
            return Response(
                {'error': f'frequency must be one of: {", ".join(valid_frequencies)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = MarketReport.objects.filter(id=report_id, user=request.user).first()
        if not report:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            monitor = MarketMonitor.objects.create(
                user=request.user,
                report=report,
                frequency=frequency,
            )
        except IntegrityError:
            return Response(
                {'error': 'A monitor already exists for this report'},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                'id': monitor.id,
                'report_id': monitor.report_id,
                'company_name': report.company_name,
                'target_market': report.target_market,
                'industry': report.industry,
                'is_active': monitor.is_active,
                'frequency': monitor.frequency,
                'last_checked': None,
                'alert_count': 0,
                'unread_alert_count': 0,
                'created_at': monitor.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class MonitorDetailView(APIView):
    """GET/PATCH/DELETE a specific monitor."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_monitor(self, request, pk):
        return (
            MarketMonitor.objects
            .filter(pk=pk, user=request.user)
            .select_related('report')
            .first()
        )

    def get(self, request, pk):
        monitor = self._get_monitor(request, pk)
        if not monitor:
            return Response({'error': 'Monitor not found'}, status=status.HTTP_404_NOT_FOUND)

        alert_count = monitor.alerts.count()
        unread_count = monitor.alerts.filter(is_read=False).count()

        return Response({
            'id': monitor.id,
            'report_id': monitor.report_id,
            'company_name': monitor.report.company_name,
            'target_market': monitor.report.target_market,
            'industry': monitor.report.industry,
            'is_active': monitor.is_active,
            'frequency': monitor.frequency,
            'last_checked': monitor.last_checked.isoformat() if monitor.last_checked else None,
            'alert_count': alert_count,
            'unread_alert_count': unread_count,
            'created_at': monitor.created_at.isoformat(),
        })

    def patch(self, request, pk):
        monitor = self._get_monitor(request, pk)
        if not monitor:
            return Response({'error': 'Monitor not found'}, status=status.HTTP_404_NOT_FOUND)

        update_fields = []

        if 'is_active' in request.data:
            monitor.is_active = bool(request.data['is_active'])
            update_fields.append('is_active')

        if 'frequency' in request.data:
            valid_frequencies = [choice[0] for choice in MarketMonitor.FREQUENCY_CHOICES]
            if request.data['frequency'] not in valid_frequencies:
                return Response(
                    {'error': f'frequency must be one of: {", ".join(valid_frequencies)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            monitor.frequency = request.data['frequency']
            update_fields.append('frequency')

        if update_fields:
            monitor.save(update_fields=update_fields)

        return Response({
            'id': monitor.id,
            'report_id': monitor.report_id,
            'is_active': monitor.is_active,
            'frequency': monitor.frequency,
        })

    def delete(self, request, pk):
        monitor = self._get_monitor(request, pk)
        if not monitor:
            return Response({'error': 'Monitor not found'}, status=status.HTTP_404_NOT_FOUND)
        monitor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AlertListView(APIView):
    """GET alerts across all user's monitors."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        alerts = (
            MarketAlert.objects
            .filter(monitor__user=request.user)
            .select_related('monitor', 'monitor__report')
        )

        unread_filter = request.query_params.get('unread')
        if unread_filter and unread_filter.lower() == 'true':
            alerts = alerts.filter(is_read=False)

        data = [
            {
                'id': a.id,
                'monitor_id': a.monitor_id,
                'report_id': a.monitor.report_id,
                'company_name': a.monitor.report.company_name,
                'target_market': a.monitor.report.target_market,
                'alert_type': a.alert_type,
                'title': a.title,
                'message': a.description,
                'severity': a.severity,
                'source_url': a.source_url,
                'is_read': a.is_read,
                'created_at': a.created_at.isoformat(),
            }
            for a in alerts[:100]
        ]
        return Response(data, status=status.HTTP_200_OK)


class AlertMarkReadView(APIView):
    """PATCH: Mark a single alert as read."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        alert = (
            MarketAlert.objects
            .filter(pk=pk, monitor__user=request.user)
            .first()
        )
        if not alert:
            return Response({'error': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)

        alert.is_read = True
        alert.save(update_fields=['is_read'])

        return Response({
            'id': alert.id,
            'is_read': alert.is_read,
        })


class ExecutionPlanView(APIView):
    """GET: List user's execution plans. POST: Create plan from report playbook."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plans = (
            ExecutionPlan.objects
            .filter(user=request.user)
            .select_related('report')
            .prefetch_related('milestones')
        )
        data = []
        for plan in plans:
            milestones = plan.milestones.all()
            total = milestones.count()
            completed = milestones.filter(is_completed=True).count()
            data.append({
                'id': plan.id,
                'report_id': plan.report_id,
                'company_name': plan.report.company_name,
                'target_market': plan.report.target_market,
                'status': plan.status,
                'started_at': plan.started_at.isoformat() if plan.started_at else None,
                'total_milestones': total,
                'completed_milestones': completed,
                'progress_pct': round((completed / total * 100) if total > 0 else 0, 1),
                'created_at': plan.created_at.isoformat(),
                'updated_at': plan.updated_at.isoformat(),
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        report_id = request.data.get('report_id')
        if not report_id:
            return Response(
                {'error': 'report_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = MarketReport.objects.filter(id=report_id, user=request.user).first()
        if not report:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if a plan already exists for this report
        existing = ExecutionPlan.objects.filter(report=report).first()
        if existing:
            return Response(
                {'error': 'An execution plan already exists for this report', 'plan_id': existing.id},
                status=status.HTTP_409_CONFLICT,
            )

        plan = ExecutionPlan.objects.create(
            user=request.user,
            report=report,
            status='not_started',
        )

        # Auto-generate milestones from playbook data
        playbook = report.playbook or {}
        phases = playbook.get('phases', [])

        if phases:
            for phase_data in phases:
                phase_num = phase_data.get('phase', 1)
                tasks = phase_data.get('tasks', [])
                if tasks:
                    for task in tasks:
                        Milestone.objects.create(
                            plan=plan,
                            title=task.get('title', phase_data.get('title', f'Phase {phase_num} Task')),
                            description=task.get('description', ''),
                            phase=phase_num,
                            estimated_cost=task.get('estimated_cost') if task.get('estimated_cost') else None,
                        )
                else:
                    # Create a single milestone for the phase
                    Milestone.objects.create(
                        plan=plan,
                        title=phase_data.get('title', f'Phase {phase_num}'),
                        description=phase_data.get('description', ''),
                        phase=phase_num,
                        estimated_cost=phase_data.get('estimated_cost') if phase_data.get('estimated_cost') else None,
                    )
        else:
            # If no playbook, create default milestones
            default_milestones = [
                {'title': 'Market Research & Validation', 'description': 'Validate market opportunity and refine strategy', 'phase': 1},
                {'title': 'Legal & Regulatory Setup', 'description': 'Complete legal entity formation and regulatory compliance', 'phase': 1},
                {'title': 'Local Team Hiring', 'description': 'Recruit key local team members', 'phase': 2},
                {'title': 'Partnership Development', 'description': 'Establish local partnerships and distribution channels', 'phase': 2},
                {'title': 'Product Localization', 'description': 'Adapt product/service for local market', 'phase': 3},
                {'title': 'Soft Launch', 'description': 'Limited market launch and feedback collection', 'phase': 3},
                {'title': 'Marketing Campaign', 'description': 'Full marketing launch in target market', 'phase': 4},
                {'title': 'Scale Operations', 'description': 'Expand operations and optimize for growth', 'phase': 4},
            ]
            for m in default_milestones:
                Milestone.objects.create(plan=plan, **m)

        # Return the created plan with milestones
        milestones = plan.milestones.all()
        return Response(
            {
                'id': plan.id,
                'report_id': plan.report_id,
                'company_name': report.company_name,
                'target_market': report.target_market,
                'status': plan.status,
                'milestones': [
                    {
                        'id': m.id,
                        'title': m.title,
                        'description': m.description,
                        'phase': m.phase,
                        'is_completed': m.is_completed,
                        'target_date': m.target_date.isoformat() if m.target_date else None,
                        'estimated_cost': str(m.estimated_cost) if m.estimated_cost else None,
                    }
                    for m in milestones
                ],
                'created_at': plan.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class ExecutionPlanDetailView(APIView):
    """GET: Return plan with all milestones."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        plan = (
            ExecutionPlan.objects
            .filter(pk=pk, user=request.user)
            .select_related('report')
            .prefetch_related('milestones')
            .first()
        )
        if not plan:
            return Response({'error': 'Execution plan not found'}, status=status.HTTP_404_NOT_FOUND)

        milestones = plan.milestones.all()
        total = milestones.count()
        completed = milestones.filter(is_completed=True).count()

        return Response({
            'id': plan.id,
            'report_id': plan.report_id,
            'company_name': plan.report.company_name,
            'target_market': plan.report.target_market,
            'industry': plan.report.industry,
            'status': plan.status,
            'started_at': plan.started_at.isoformat() if plan.started_at else None,
            'total_milestones': total,
            'completed_milestones': completed,
            'progress_pct': round((completed / total * 100) if total > 0 else 0, 1),
            'milestones': [
                {
                    'id': m.id,
                    'title': m.title,
                    'description': m.description,
                    'phase': m.phase,
                    'target_date': m.target_date.isoformat() if m.target_date else None,
                    'completed_date': m.completed_date.isoformat() if m.completed_date else None,
                    'is_completed': m.is_completed,
                    'estimated_cost': str(m.estimated_cost) if m.estimated_cost else None,
                    'actual_cost': float(m.actual_cost) if m.actual_cost else None,
                    'notes': m.notes,
                    'created_at': m.created_at.isoformat(),
                }
                for m in milestones
            ],
            'created_at': plan.created_at.isoformat(),
            'updated_at': plan.updated_at.isoformat(),
        })

    def patch(self, request, pk):
        plan = (
            ExecutionPlan.objects
            .filter(pk=pk, user=request.user)
            .first()
        )
        if not plan:
            return Response({'error': 'Execution plan not found'}, status=status.HTTP_404_NOT_FOUND)

        update_fields = []

        if 'status' in request.data:
            valid_statuses = [choice[0] for choice in ExecutionPlan.STATUS_CHOICES]
            if request.data['status'] not in valid_statuses:
                return Response(
                    {'error': f'status must be one of: {", ".join(valid_statuses)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            plan.status = request.data['status']
            update_fields.append('status')

            # Auto-set started_at when moving to in_progress
            if plan.status == 'in_progress' and not plan.started_at:
                plan.started_at = datetime.now()
                update_fields.append('started_at')

        if update_fields:
            plan.save(update_fields=update_fields)

        return Response({
            'id': plan.id,
            'status': plan.status,
            'started_at': plan.started_at.isoformat() if plan.started_at else None,
        })


class MilestoneUpdateView(APIView):
    """PATCH: Toggle completion, update cost, add notes."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        milestone = (
            Milestone.objects
            .filter(pk=pk, plan__user=request.user)
            .first()
        )
        if not milestone:
            return Response({'error': 'Milestone not found'}, status=status.HTTP_404_NOT_FOUND)

        update_fields = []

        if 'is_completed' in request.data:
            milestone.is_completed = bool(request.data['is_completed'])
            update_fields.append('is_completed')
            if milestone.is_completed:
                milestone.completed_date = date.today()
            else:
                milestone.completed_date = None
            update_fields.append('completed_date')

        if 'actual_cost' in request.data:
            try:
                milestone.actual_cost = request.data['actual_cost']
                update_fields.append('actual_cost')
            except (ValueError, TypeError):
                return Response(
                    {'error': 'actual_cost must be a valid decimal number'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if 'notes' in request.data:
            milestone.notes = str(request.data['notes'])
            update_fields.append('notes')

        if 'target_date' in request.data:
            try:
                milestone.target_date = request.data['target_date']
                update_fields.append('target_date')
            except (ValueError, TypeError):
                return Response(
                    {'error': 'target_date must be a valid date (YYYY-MM-DD)'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if update_fields:
            milestone.save(update_fields=update_fields)

        # Auto-update plan status based on milestones
        plan = milestone.plan
        all_milestones = plan.milestones.all()
        completed_count = all_milestones.filter(is_completed=True).count()
        total_count = all_milestones.count()

        if completed_count == total_count and total_count > 0:
            plan.status = 'completed'
            plan.save(update_fields=['status'])
        elif completed_count > 0 and plan.status == 'not_started':
            plan.status = 'in_progress'
            if not plan.started_at:
                plan.started_at = datetime.now()
                plan.save(update_fields=['status', 'started_at'])
            else:
                plan.save(update_fields=['status'])

        return Response({
            'id': milestone.id,
            'title': milestone.title,
            'phase': milestone.phase,
            'is_completed': milestone.is_completed,
            'completed_date': milestone.completed_date.isoformat() if milestone.completed_date else None,
            'actual_cost': float(milestone.actual_cost) if milestone.actual_cost else None,
            'notes': milestone.notes,
            'target_date': milestone.target_date.isoformat() if milestone.target_date else None,
        })


class CompetitorTrackerListView(APIView):
    """GET: List tracked competitors. POST: Create tracker."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        trackers = (
            CompetitorTracker.objects
            .filter(user=request.user)
            .select_related('report')
            .annotate(update_count=Count('updates'))
        )
        data = [
            {
                'id': t.id,
                'report_id': t.report_id,
                'company_name': t.report.company_name,
                'target_market': t.report.target_market,
                'competitor_name': t.competitor_name,
                'is_active': t.is_active,
                'last_checked': t.last_checked.isoformat() if t.last_checked else None,
                'update_count': t.update_count,
                'created_at': t.created_at.isoformat(),
            }
            for t in trackers
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        report_id = request.data.get('report_id')
        competitor_name = request.data.get('competitor_name', '').strip()

        if not report_id or not competitor_name:
            return Response(
                {'error': 'report_id and competitor_name are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = MarketReport.objects.filter(id=report_id, user=request.user).first()
        if not report:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            tracker = CompetitorTracker.objects.create(
                user=request.user,
                report=report,
                competitor_name=competitor_name,
            )
        except IntegrityError:
            return Response(
                {'error': 'Already tracking this competitor for this report'},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                'id': tracker.id,
                'report_id': tracker.report_id,
                'competitor_name': tracker.competitor_name,
                'is_active': tracker.is_active,
                'update_count': 0,
                'created_at': tracker.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class CompetitorTrackerDetailView(APIView):
    """PATCH/DELETE a specific competitor tracker."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        tracker = CompetitorTracker.objects.filter(pk=pk, user=request.user).first()
        if not tracker:
            return Response({'error': 'Tracker not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            tracker.is_active = bool(request.data['is_active'])
            tracker.save(update_fields=['is_active'])

        return Response({
            'id': tracker.id,
            'competitor_name': tracker.competitor_name,
            'is_active': tracker.is_active,
        })

    def delete(self, request, pk):
        tracker = CompetitorTracker.objects.filter(pk=pk, user=request.user).first()
        if not tracker:
            return Response({'error': 'Tracker not found'}, status=status.HTTP_404_NOT_FOUND)
        tracker.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CompetitorUpdateListView(APIView):
    """GET: Recent updates across all tracked competitors."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        updates = (
            CompetitorUpdate.objects
            .filter(tracker__user=request.user)
            .select_related('tracker', 'tracker__report')
            .order_by('-detected_at')[:100]
        )
        data = [
            {
                'id': u.id,
                'tracker_id': u.tracker_id,
                'competitor_name': u.tracker.competitor_name,
                'report_id': u.tracker.report_id,
                'company_name': u.tracker.report.company_name,
                'target_market': u.tracker.report.target_market,
                'update_type': u.update_type,
                'title': u.title,
                'description': u.description,
                'source_url': u.source_url,
                'detected_at': u.detected_at.isoformat(),
            }
            for u in updates
        ]
        return Response(data, status=status.HTTP_200_OK)


class NewsFeedView(APIView):
    """GET: Return relevant market news. Supports ?market= and ?industry= filters."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        market = request.query_params.get('market', '')
        industry = request.query_params.get('industry', '')

        # Return mock/cached news data for now (can be enhanced with real AI agent later)
        news_items = [
            {
                'id': 1,
                'title': f'New regulatory framework proposed for {industry or "international"} businesses in {market or "global markets"}',
                'description': 'Government officials have announced plans to streamline the registration process for foreign companies, potentially reducing setup time by 40%.',
                'category': 'regulatory',
                'source': 'Market Intelligence Daily',
                'url': '',
                'published_at': '2025-01-15T09:00:00Z',
                'relevance': 'high',
            },
            {
                'id': 2,
                'title': f'Major competitor announces expansion into {market or "emerging markets"}',
                'description': 'A leading industry player has revealed plans for significant investment in market expansion, signaling growing confidence in the region.',
                'category': 'competitive',
                'source': 'Business Wire',
                'url': '',
                'published_at': '2025-01-14T14:30:00Z',
                'relevance': 'high',
            },
            {
                'id': 3,
                'title': f'{market or "Global"} {industry or "tech"} market projected to grow 15% in 2025',
                'description': 'Industry analysts project strong growth driven by digital transformation, increasing consumer spending, and favorable policy changes.',
                'category': 'economic',
                'source': 'Reuters',
                'url': '',
                'published_at': '2025-01-13T11:00:00Z',
                'relevance': 'high',
            },
            {
                'id': 4,
                'title': f'New trade agreement simplifies market entry for {industry or "technology"} companies',
                'description': 'A bilateral trade agreement has been signed that reduces tariffs and simplifies compliance requirements for foreign businesses.',
                'category': 'market',
                'source': 'Financial Times',
                'url': '',
                'published_at': '2025-01-12T08:00:00Z',
                'relevance': 'medium',
            },
            {
                'id': 5,
                'title': f'Consumer spending in {market or "target market"} reaches record highs',
                'description': 'Rising middle-class incomes and increased digital adoption are driving unprecedented consumer spending in the region.',
                'category': 'economic',
                'source': 'Bloomberg',
                'url': '',
                'published_at': '2025-01-11T16:00:00Z',
                'relevance': 'medium',
            },
        ]

        return Response({
            'market': market,
            'industry': industry,
            'articles': news_items,
            'total': len(news_items),
        }, status=status.HTTP_200_OK)
