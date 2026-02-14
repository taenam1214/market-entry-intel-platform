from django.contrib import admin
from .models import Organization, TeamMember, TeamInvite


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at', 'updated_at')
    search_fields = ('name', 'owner__email')
    ordering = ('-created_at',)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'org', 'role', 'invited_by', 'joined_at')
    list_filter = ('role',)
    search_fields = ('user__email', 'org__name')
    ordering = ('-joined_at',)


@admin.register(TeamInvite)
class TeamInviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'org', 'role', 'invited_by', 'is_accepted', 'created_at')
    list_filter = ('is_accepted', 'role')
    search_fields = ('email', 'org__name')
    ordering = ('-created_at',)
