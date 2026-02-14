from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import IntegrityError
from django.db.models import Q
import uuid
import logging

from .models import Organization, TeamMember, TeamInvite

logger = logging.getLogger(__name__)


class OrganizationListCreateView(APIView):
    """GET: List user's organizations. POST: Create new org."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        orgs = Organization.objects.filter(
            Q(owner=user) | Q(members__user=user)
        ).distinct()

        data = []
        for org in orgs:
            membership = TeamMember.objects.filter(org=org, user=user).first()
            data.append({
                'id': org.id,
                'name': org.name,
                'owner_id': org.owner_id,
                'owner_email': org.owner.email,
                'role': membership.role if membership else ('owner' if org.owner == user else None),
                'member_count': org.members.count(),
                'created_at': org.created_at.isoformat(),
                'updated_at': org.updated_at.isoformat(),
            })

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('name', '').strip()
        if not name:
            return Response(
                {'error': 'Organization name is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        org = Organization.objects.create(name=name, owner=request.user)
        TeamMember.objects.create(org=org, user=request.user, role='owner')

        return Response(
            {
                'id': org.id,
                'name': org.name,
                'owner_id': org.owner_id,
                'owner_email': org.owner.email,
                'role': 'owner',
                'member_count': 1,
                'created_at': org.created_at.isoformat(),
                'updated_at': org.updated_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class OrganizationDetailView(APIView):
    """GET/PATCH/DELETE for a single organization."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_org_and_membership(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return None, None, Response(
                {'error': 'Organization not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        membership = TeamMember.objects.filter(org=org, user=request.user).first()
        if not membership:
            return None, None, Response(
                {'error': 'You are not a member of this organization.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return org, membership, None

    def get(self, request, pk):
        org, membership, err = self._get_org_and_membership(request, pk)
        if err:
            return err
        return Response({
            'id': org.id,
            'name': org.name,
            'owner_id': org.owner_id,
            'owner_email': org.owner.email,
            'role': membership.role,
            'member_count': org.members.count(),
            'created_at': org.created_at.isoformat(),
            'updated_at': org.updated_at.isoformat(),
        })

    def patch(self, request, pk):
        org, membership, err = self._get_org_and_membership(request, pk)
        if err:
            return err
        if membership.role not in ('owner', 'admin'):
            return Response(
                {'error': 'Only owner or admin can update the organization.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        name = request.data.get('name', '').strip()
        if name:
            org.name = name
            org.save(update_fields=['name', 'updated_at'])

        return Response({
            'id': org.id,
            'name': org.name,
            'owner_id': org.owner_id,
            'updated_at': org.updated_at.isoformat(),
        })

    def delete(self, request, pk):
        org, membership, err = self._get_org_and_membership(request, pk)
        if err:
            return err
        if membership.role not in ('owner', 'admin'):
            return Response(
                {'error': 'Only owner or admin can delete the organization.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        org.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamMemberListView(APIView):
    """GET: List members of an organization."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not TeamMember.objects.filter(org=org, user=request.user).exists():
            return Response(
                {'error': 'You are not a member of this organization.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        members = TeamMember.objects.filter(org=org).select_related('user', 'invited_by')
        data = []
        for m in members:
            data.append({
                'id': m.id,
                'user_id': m.user_id,
                'email': m.user.email,
                'first_name': m.user.first_name,
                'last_name': m.user.last_name,
                'role': m.role,
                'invited_by': m.invited_by.email if m.invited_by else None,
                'joined_at': m.joined_at.isoformat(),
            })

        return Response(data, status=status.HTTP_200_OK)


class TeamMemberUpdateView(APIView):
    """PATCH: Update member role. DELETE: Remove member."""
    permission_classes = [permissions.IsAuthenticated]

    def _check_admin(self, request, member):
        caller_membership = TeamMember.objects.filter(
            org=member.org, user=request.user
        ).first()
        if not caller_membership or caller_membership.role not in ('owner', 'admin'):
            return Response(
                {'error': 'Only owner or admin can manage members.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def patch(self, request, pk):
        try:
            member = TeamMember.objects.select_related('org', 'user').get(pk=pk)
        except TeamMember.DoesNotExist:
            return Response(
                {'error': 'Member not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        err = self._check_admin(request, member)
        if err:
            return err

        if member.role == 'owner':
            return Response(
                {'error': 'Cannot change the owner role.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_role = request.data.get('role')
        valid_roles = [c[0] for c in TeamMember.ROLE_CHOICES if c[0] != 'owner']
        if new_role and new_role in valid_roles:
            member.role = new_role
            member.save(update_fields=['role'])
        elif new_role:
            return Response(
                {'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            'id': member.id,
            'user_id': member.user_id,
            'email': member.user.email,
            'role': member.role,
        })

    def delete(self, request, pk):
        try:
            member = TeamMember.objects.select_related('org', 'user').get(pk=pk)
        except TeamMember.DoesNotExist:
            return Response(
                {'error': 'Member not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        err = self._check_admin(request, member)
        if err:
            return err

        if member.role == 'owner':
            return Response(
                {'error': 'Cannot remove the owner.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InviteCreateView(APIView):
    """POST: Create and send an invite to join an organization."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        caller_membership = TeamMember.objects.filter(
            org=org, user=request.user
        ).first()
        if not caller_membership or caller_membership.role not in ('owner', 'admin'):
            return Response(
                {'error': 'Only owner or admin can invite members.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get('email', '').strip().lower()
        role = request.data.get('role', 'viewer')

        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_roles = [c[0] for c in TeamMember.ROLE_CHOICES if c[0] != 'owner']
        if role not in valid_roles:
            return Response(
                {'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if TeamMember.objects.filter(org=org, user__email=email).exists():
            return Response(
                {'error': 'User is already a member of this organization.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            invite = TeamInvite.objects.create(
                org=org,
                email=email,
                role=role,
                invited_by=request.user,
                token=uuid.uuid4().hex,
            )
        except IntegrityError:
            return Response(
                {'error': 'An invite for this email already exists for this organization.'},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                'id': invite.id,
                'email': invite.email,
                'role': invite.role,
                'token': invite.token,
                'org_id': org.id,
                'org_name': org.name,
                'created_at': invite.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class InviteAcceptView(APIView):
    """POST: Accept an invite by token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token', '').strip()
        if not token:
            return Response(
                {'error': 'Invite token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            invite = TeamInvite.objects.select_related('org').get(token=token)
        except TeamInvite.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired invite token.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if invite.is_accepted:
            return Response(
                {'error': 'This invite has already been accepted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if TeamMember.objects.filter(org=invite.org, user=request.user).exists():
            return Response(
                {'error': 'You are already a member of this organization.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            TeamMember.objects.create(
                org=invite.org,
                user=request.user,
                role=invite.role,
                invited_by=invite.invited_by,
            )
        except IntegrityError:
            return Response(
                {'error': 'You are already a member of this organization.'},
                status=status.HTTP_409_CONFLICT,
            )

        invite.is_accepted = True
        invite.save(update_fields=['is_accepted'])

        return Response(
            {
                'message': f'Successfully joined {invite.org.name}.',
                'org_id': invite.org.id,
                'org_name': invite.org.name,
                'role': invite.role,
            },
            status=status.HTTP_200_OK,
        )


class InviteListView(APIView):
    """GET: List pending invites for an organization."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        caller_membership = TeamMember.objects.filter(
            org=org, user=request.user
        ).first()
        if not caller_membership or caller_membership.role not in ('owner', 'admin'):
            return Response(
                {'error': 'Only owner or admin can view invites.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        invites = TeamInvite.objects.filter(org=org, is_accepted=False).select_related('invited_by')
        data = []
        for inv in invites:
            data.append({
                'id': inv.id,
                'email': inv.email,
                'role': inv.role,
                'invited_by': inv.invited_by.email,
                'token': inv.token,
                'created_at': inv.created_at.isoformat(),
            })

        return Response(data, status=status.HTTP_200_OK)
