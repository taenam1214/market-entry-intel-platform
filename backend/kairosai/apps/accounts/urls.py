from django.urls import path
from .views import (
    signup, login_view, logout_view, profile, update_profile,
    google_auth, change_password, change_email,
    send_verification_email, verify_email_code,
    AdminDashboardView, AdminUsersView, AdminReportsView,
)

urlpatterns = [
    path("signup/", signup, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("profile/", profile, name="profile"),
    path("profile/update/", update_profile, name="update_profile"),
    path("google-auth/", google_auth, name="google_auth"),
    path("change-password/", change_password, name="change_password"),
    path("change-email/", change_email, name="change_email"),
    path("send-verification-email/", send_verification_email, name="send_verification_email"),
    path("verify-email-code/", verify_email_code, name="verify_email_code"),

    # Admin endpoints
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin_dashboard"),
    path("admin/users/", AdminUsersView.as_view(), name="admin_users"),
    path("admin/users/<int:pk>/", AdminUsersView.as_view(), name="admin_user_detail"),
    path("admin/reports/", AdminReportsView.as_view(), name="admin_reports"),
]
