from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import IntegrityError
import logging

from .models import APIKey

logger = logging.getLogger(__name__)


class APIKeyListCreateView(APIView):
    """GET: List user's API keys (masked). POST: Create new key."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        keys = APIKey.objects.filter(user=request.user)
        data = []
        for k in keys:
            data.append({
                'id': k.id,
                'name': k.name,
                'key': k.key[:8] + '...',
                'is_active': k.is_active,
                'usage_count': k.usage_count,
                'last_used': k.last_used.isoformat() if k.last_used else None,
                'created_at': k.created_at.isoformat(),
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('name', '').strip()
        if not name:
            return Response(
                {'error': 'API key name is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            key = APIKey(user=request.user, name=name)
            key.save()
        except IntegrityError:
            return Response(
                {'error': 'Failed to generate a unique key. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                'id': key.id,
                'name': key.name,
                'key': key.key,
                'is_active': key.is_active,
                'usage_count': key.usage_count,
                'last_used': None,
                'created_at': key.created_at.isoformat(),
                'message': 'Store this key securely. It will not be shown again.',
            },
            status=status.HTTP_201_CREATED,
        )


class APIKeyDetailView(APIView):
    """PATCH: Toggle active/rename. DELETE: Revoke key."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_key(self, request, pk):
        try:
            return APIKey.objects.get(pk=pk, user=request.user), None
        except APIKey.DoesNotExist:
            return None, Response(
                {'error': 'API key not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

    def patch(self, request, pk):
        key, err = self._get_key(request, pk)
        if err:
            return err

        updated_fields = []

        name = request.data.get('name')
        if name is not None:
            key.name = name.strip()
            updated_fields.append('name')

        is_active = request.data.get('is_active')
        if is_active is not None:
            key.is_active = bool(is_active)
            updated_fields.append('is_active')

        if updated_fields:
            key.save(update_fields=updated_fields)

        return Response({
            'id': key.id,
            'name': key.name,
            'key': key.key[:8] + '...',
            'is_active': key.is_active,
            'usage_count': key.usage_count,
            'last_used': key.last_used.isoformat() if key.last_used else None,
            'created_at': key.created_at.isoformat(),
        })

    def delete(self, request, pk):
        key, err = self._get_key(request, pk)
        if err:
            return err
        key.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class APIKeyUsageView(APIView):
    """GET: Return usage stats for an API key."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            key = APIKey.objects.get(pk=pk, user=request.user)
        except APIKey.DoesNotExist:
            return Response(
                {'error': 'API key not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'id': key.id,
            'name': key.name,
            'is_active': key.is_active,
            'usage_count': key.usage_count,
            'last_used': key.last_used.isoformat() if key.last_used else None,
            'created_at': key.created_at.isoformat(),
        })
