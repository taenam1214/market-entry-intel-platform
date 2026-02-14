import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Subscription, PaymentHistory


stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

TIER_PRICE_MAP = {
    'starter': getattr(settings, 'STRIPE_STARTER_PRICE_ID', ''),
    'professional': getattr(settings, 'STRIPE_PROFESSIONAL_PRICE_ID', ''),
    'enterprise': getattr(settings, 'STRIPE_ENTERPRISE_PRICE_ID', ''),
}


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tier = request.data.get('tier')
        if tier not in TIER_PRICE_MAP:
            return Response({'error': 'Invalid tier'}, status=status.HTTP_400_BAD_REQUEST)

        price_id = TIER_PRICE_MAP[tier]
        if not price_id:
            return Response({'error': 'Stripe price not configured for this tier'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Get or create Stripe customer
            subscription, created = Subscription.objects.get_or_create(
                user=request.user,
                defaults={'stripe_customer_id': ''}
            )

            if not subscription.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=f"{request.user.first_name} {request.user.last_name}",
                    metadata={'user_id': str(request.user.id)}
                )
                subscription.stripe_customer_id = customer.id
                subscription.save()

            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            session = stripe.checkout.Session.create(
                customer=subscription.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{'price': price_id, 'quantity': 1}],
                mode='subscription',
                success_url=f'{frontend_url}/settings?session_id={{CHECKOUT_SESSION_ID}}&success=true',
                cancel_url=f'{frontend_url}/pricing?canceled=true',
                metadata={'user_id': str(request.user.id), 'tier': tier}
            )

            return Response({'url': session.url})

        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event_type = event['type']
        data = event['data']['object']

        if event_type == 'checkout.session.completed':
            self._handle_checkout_completed(data)
        elif event_type == 'invoice.paid':
            self._handle_invoice_paid(data)
        elif event_type == 'customer.subscription.updated':
            self._handle_subscription_updated(data)
        elif event_type == 'customer.subscription.deleted':
            self._handle_subscription_deleted(data)

        return Response(status=status.HTTP_200_OK)

    def _handle_checkout_completed(self, session):
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        tier = session.get('metadata', {}).get('tier', 'starter')

        try:
            sub = Subscription.objects.get(stripe_customer_id=customer_id)
            sub.stripe_subscription_id = subscription_id
            sub.tier = tier
            sub.status = 'active'
            sub.save()

            # Update user tier
            sub.user.subscription_tier = tier
            sub.user.save(update_fields=['subscription_tier'])
        except Subscription.DoesNotExist:
            pass

    def _handle_invoice_paid(self, invoice):
        customer_id = invoice.get('customer')
        amount = invoice.get('amount_paid', 0) / 100  # Convert from cents

        try:
            sub = Subscription.objects.get(stripe_customer_id=customer_id)
            PaymentHistory.objects.create(
                user=sub.user,
                stripe_payment_intent_id=invoice.get('payment_intent', ''),
                amount=amount,
                currency=invoice.get('currency', 'usd'),
                status='succeeded',
                description=f"Subscription payment - {sub.tier}"
            )
        except Subscription.DoesNotExist:
            pass

    def _handle_subscription_updated(self, subscription):
        customer_id = subscription.get('customer')
        try:
            sub = Subscription.objects.get(stripe_customer_id=customer_id)
            sub.status = subscription.get('status', 'active')
            if subscription.get('current_period_start'):
                from datetime import datetime
                sub.current_period_start = datetime.fromtimestamp(subscription['current_period_start'])
            if subscription.get('current_period_end'):
                from datetime import datetime
                sub.current_period_end = datetime.fromtimestamp(subscription['current_period_end'])
            sub.save()
        except Subscription.DoesNotExist:
            pass

    def _handle_subscription_deleted(self, subscription):
        customer_id = subscription.get('customer')
        try:
            sub = Subscription.objects.get(stripe_customer_id=customer_id)
            sub.status = 'canceled'
            sub.tier = 'free'
            sub.save()

            sub.user.subscription_tier = 'free'
            sub.user.save(update_fields=['subscription_tier'])
        except Subscription.DoesNotExist:
            pass


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
            if not subscription.stripe_customer_id:
                return Response({'error': 'No billing account found'}, status=status.HTTP_404_NOT_FOUND)

            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            session = stripe.billing_portal.Session.create(
                customer=subscription.stripe_customer_id,
                return_url=f'{frontend_url}/settings',
            )
            return Response({'url': session.url})
        except Subscription.DoesNotExist:
            return Response({'error': 'No subscription found'}, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
            return Response({
                'tier': subscription.tier,
                'status': subscription.status,
                'analyses_used': subscription.analyses_used,
                'current_period_start': subscription.current_period_start,
                'current_period_end': subscription.current_period_end,
            })
        except Subscription.DoesNotExist:
            return Response({
                'tier': 'free',
                'status': 'active',
                'analyses_used': request.user.analyses_used_this_period,
                'current_period_start': None,
                'current_period_end': None,
            })
