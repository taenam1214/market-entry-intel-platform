from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'subscription_tier', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'subscription_tier', 'is_verified', 'is_active', 'provider')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_picture')}),
        ('Roles & Subscription', {'fields': ('role', 'subscription_tier', 'analyses_used_this_period', 'billing_period_start')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('OAuth', {'fields': ('google_id', 'provider')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'verification_type', 'is_used', 'created_at', 'expires_at')
    list_filter = ('verification_type', 'is_used')
    search_fields = ('user__email', 'code')
