from rest_framework.permissions import BasePermission


TIER_ANALYSIS_LIMITS = {
    'free': 1,
    'starter': 3,
    'professional': float('inf'),
    'enterprise': float('inf'),
}


class IsAdmin(BasePermission):
    """Only allow access to admin users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class HasAnalysisQuota(BasePermission):
    """Check if the user has remaining analysis quota for their tier."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins bypass quota checks
        if request.user.is_admin:
            return True

        tier = request.user.subscription_tier
        limit = TIER_ANALYSIS_LIMITS.get(tier, 1)
        return request.user.analyses_used_this_period < limit


class IsAdminOrOwner(BasePermission):
    """Admin can access any resource, regular users only their own."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True

        # Check common owner field names
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user

        return False
