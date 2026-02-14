from django.contrib import admin
from .models import Subscription, PaymentHistory


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'tier', 'status', 'stripe_customer_id', 'analyses_used', 'created_at')
    list_filter = ('tier', 'status')
    search_fields = ('user__email', 'stripe_customer_id')


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status', 'currency')
    search_fields = ('user__email', 'stripe_payment_intent_id')
