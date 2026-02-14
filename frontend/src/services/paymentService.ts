import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface SubscriptionStatus {
  tier: string;
  status: string;
  analyses_used: number;
  current_period_start: string | null;
  current_period_end: string | null;
}

export const paymentService = {
  async createCheckoutSession(tier: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.PAYMENTS.CREATE_CHECKOUT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tier }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  },

  async openBillingPortal(): Promise<void> {
    const response = await fetch(API_ENDPOINTS.PAYMENTS.BILLING_PORTAL, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to open billing portal');
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await fetch(API_ENDPOINTS.PAYMENTS.STATUS, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    return response.json();
  },
};
