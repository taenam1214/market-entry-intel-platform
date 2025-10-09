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
  
  // Chat endpoints
  CHAT: {
    CONVERSATIONS: `${API_BASE_URL}/chat/conversations/`,
    MESSAGES: `${API_BASE_URL}/chat/messages/`,
    CONVERSATION_BY_ID: (id: number) => `${API_BASE_URL}/chat/conversations/${id}/`,
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

