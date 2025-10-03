from django.urls import path
from .views import signup, login_view, logout_view, profile, update_profile, google_auth, change_password

urlpatterns = [
    path("signup/", signup, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("profile/", profile, name="profile"),
    path("profile/update/", update_profile, name="update_profile"),
    path("google-auth/", google_auth, name="google_auth"),
    path("change-password/", change_password, name="change_password"),
]