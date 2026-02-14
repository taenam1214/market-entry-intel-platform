from django.urls import path
from .views import (
    CreateCheckoutSessionView,
    WebhookView,
    BillingPortalView,
    SubscriptionStatusView,
)

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create_checkout_session'),
    path('webhook/', WebhookView.as_view(), name='stripe_webhook'),
    path('billing-portal/', BillingPortalView.as_view(), name='billing_portal'),
    path('status/', SubscriptionStatusView.as_view(), name='subscription_status'),
]
