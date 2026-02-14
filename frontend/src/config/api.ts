/**
 * Centralized API configuration
 * Uses Vite environment variables
 */

// Get API base URL from environment variable, fallback to production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://market-entry-intel-platform-production.up.railway.app/api/v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login/`,
    SIGNUP: `${API_BASE_URL}/auth/signup/`,
    LOGOUT: `${API_BASE_URL}/auth/logout/`,
    PROFILE: `${API_BASE_URL}/auth/profile/`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile/update/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password/`,
    CHANGE_EMAIL: `${API_BASE_URL}/auth/change-email/`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email-code/`,
    SEND_VERIFICATION: `${API_BASE_URL}/auth/send-verification-email/`,
    GOOGLE_AUTH: `${API_BASE_URL}/auth/google-auth/`,
    ADMIN_DASHBOARD: `${API_BASE_URL}/auth/admin/dashboard/`,
    ADMIN_USERS: `${API_BASE_URL}/auth/admin/users/`,
    ADMIN_USER_BY_ID: (id: number) => `${API_BASE_URL}/auth/admin/users/${id}/`,
    ADMIN_REPORTS: `${API_BASE_URL}/auth/admin/reports/`,
  },
  
  // Analysis endpoints
  ANALYSIS: {
    COMPREHENSIVE: `${API_BASE_URL}/comprehensive-analysis/`,
    COMPETITOR: `${API_BASE_URL}/competitor-analysis/`,
    SEGMENT_ARBITRAGE: `${API_BASE_URL}/segment-arbitrage/`,
  },
  
  // Reports endpoints
  REPORTS: {
    LIST: `${API_BASE_URL}/reports/`,
    SELECTOR: `${API_BASE_URL}/reports/?selector=true`,
    LATEST_DASHBOARD: `${API_BASE_URL}/latest-dashboard/`,
    BY_ID: (id: string) => `${API_BASE_URL}/reports/${id}/`,
  },
  
  // Payment endpoints
  PAYMENTS: {
    CREATE_CHECKOUT: `${API_BASE_URL}/payments/create-checkout-session/`,
    BILLING_PORTAL: `${API_BASE_URL}/payments/billing-portal/`,
    STATUS: `${API_BASE_URL}/payments/status/`,
  },

  // Report download endpoints
  DOWNLOAD: {
    REPORT: (reportId: number, type: string) => `${API_BASE_URL}/reports/${reportId}/download/${type}/`,
  },

  // Phase 3: Advanced Analysis endpoints
  ADVANCED: {
    MULTI_MARKET: `${API_BASE_URL}/multi-market-analysis/`,
    MULTI_MARKET_REPORTS: `${API_BASE_URL}/multi-market-reports/`,
    SCENARIO_MODEL: `${API_BASE_URL}/scenario-model/`,
    DEEP_DIVE: `${API_BASE_URL}/deep-dive/`,
    FINANCIAL_MODEL: (reportId: number) => `${API_BASE_URL}/reports/${reportId}/financial-model/`,
  },

  // Chat endpoints
  CHAT: {
    CONVERSATIONS: `${API_BASE_URL}/chat/conversations/`,
    MESSAGES: `${API_BASE_URL}/chat/messages/`,
    CONVERSATION_BY_ID: (id: number) => `${API_BASE_URL}/chat/conversations/${id}/`,
  },

  // Monitoring & Execution endpoints
  MONITORING: {
    MONITORS: `${API_BASE_URL}/monitors/`,
    MONITOR_BY_ID: (id: number) => `${API_BASE_URL}/monitors/${id}/`,
    ALERTS: `${API_BASE_URL}/alerts/`,
    ALERT_READ: (id: number) => `${API_BASE_URL}/alerts/${id}/read/`,
    EXECUTION_PLANS: `${API_BASE_URL}/execution-plans/`,
    EXECUTION_PLAN_BY_ID: (id: number) => `${API_BASE_URL}/execution-plans/${id}/`,
    MILESTONES: (id: number) => `${API_BASE_URL}/milestones/${id}/`,
    COMPETITOR_TRACKERS: `${API_BASE_URL}/competitor-trackers/`,
    COMPETITOR_TRACKER_BY_ID: (id: number) => `${API_BASE_URL}/competitor-trackers/${id}/`,
    COMPETITOR_UPDATES: `${API_BASE_URL}/competitor-updates/`,
    NEWS_FEED: `${API_BASE_URL}/news-feed/`,
    PLAYBOOK: (reportId: number) => `${API_BASE_URL}/reports/${reportId}/playbook/`,
  },

  // Teams endpoints
  TEAMS: {
    ORGANIZATIONS: `${API_BASE_URL}/teams/organizations/`,
    ORGANIZATION_BY_ID: (id: number) => `${API_BASE_URL}/teams/organizations/${id}/`,
    MEMBERS: (orgId: number) => `${API_BASE_URL}/teams/organizations/${orgId}/members/`,
    MEMBER_BY_ID: (id: number) => `${API_BASE_URL}/teams/members/${id}/`,
    INVITE: (orgId: number) => `${API_BASE_URL}/teams/organizations/${orgId}/invite/`,
    ACCEPT_INVITE: `${API_BASE_URL}/teams/invite/accept/`,
    INVITES: (orgId: number) => `${API_BASE_URL}/teams/organizations/${orgId}/invites/`,
  },

  // Sharing endpoints
  SHARING: {
    SHARE_REPORT: (reportId: number) => `${API_BASE_URL}/reports/${reportId}/share/`,
    UNSHARE_REPORT: (reportId: number) => `${API_BASE_URL}/reports/${reportId}/unshare/`,
    SHARED_REPORT: (token: string) => `${API_BASE_URL}/shared/${token}/`,
  },

  // Benchmark endpoints
  BENCHMARKS: {
    GET: `${API_BASE_URL}/benchmarks/`,
  },

  // API Keys endpoints
  API_KEYS: {
    LIST: `${API_BASE_URL}/api-keys/`,
    BY_ID: (id: number) => `${API_BASE_URL}/api-keys/${id}/`,
    USAGE: (id: number) => `${API_BASE_URL}/api-keys/${id}/usage/`,
  },
};

/**
 * Get authentication headers
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
};

