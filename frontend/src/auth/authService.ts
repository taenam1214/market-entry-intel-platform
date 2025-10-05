const API_BASE_URL = 'http://localhost:8000/api/v1';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    created_at: string;
    provider?: string;
    profile_picture?: string;
  };
  email_verification_required?: boolean;
  email_send_failed?: boolean;
  token?: string; // Only present if no email verification required
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

class AuthService {
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          password_confirm: userData.password, // Backend expects password_confirm
          first_name: userData.first_name,
          last_name: userData.last_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async sendVerificationEmail(email: string, verificationType: string = 'signup'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-verification-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verification_type: verificationType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send verification email');
      }

      return await response.json();
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async verifyEmailCode(email: string, code: string, verificationType: string = 'signup'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
          verification_type: verificationType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      return await response.json();
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      // Even if the API call fails, we should clear local storage
      localStorage.removeItem('authToken');
      
      if (!response.ok) {
        console.warn('Logout API call failed, but local storage cleared');
      }
    } catch (error) {
      console.warn('Logout failed:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('authToken');
    }
  }
}

export const authService = new AuthService();