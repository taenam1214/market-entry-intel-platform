from django.urls import path
from .views import (
    OrganizationListCreateView,
    OrganizationDetailView,
    TeamMemberListView,
    TeamMemberUpdateView,
    InviteCreateView,
    InviteAcceptView,
    InviteListView,
)

app_name = 'teams'

urlpatterns = [
    path('organizations/', OrganizationListCreateView.as_view(), name='org-list-create'),
    path('organizations/<int:pk>/', OrganizationDetailView.as_view(), name='org-detail'),
    path('organizations/<int:pk>/members/', TeamMemberListView.as_view(), name='member-list'),
    path('members/<int:pk>/', TeamMemberUpdateView.as_view(), name='member-update'),
    path('organizations/<int:pk>/invite/', InviteCreateView.as_view(), name='invite-create'),
    path('invite/accept/', InviteAcceptView.as_view(), name='invite-accept'),
    path('organizations/<int:pk>/invites/', InviteListView.as_view(), name='invite-list'),
]
