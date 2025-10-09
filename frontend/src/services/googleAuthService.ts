// Google OAuth Service
import type { GoogleUser, GoogleAuthResponse } from '../types/googleAuth';
import { API_ENDPOINTS } from '../config/api';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

class GoogleAuthService {
  private clientId: string;
  private isLoaded = false;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  async loadGoogleScript(): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google script'));
      };
      document.head.appendChild(script);
    });
  }

  async initialize(): Promise<void> {
    await this.loadGoogleScript();
    
    if (!window.google) {
      throw new Error('Google script not loaded');
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  private handleCredentialResponse(response: GoogleAuthResponse): void {
    // This will be overridden by the component using this service
    console.log('Google credential response:', response);
  }

  renderButton(element: HTMLElement, onSuccess: (response: GoogleAuthResponse) => void): void {
    if (!this.isLoaded || !window.google) {
      throw new Error('Google script not loaded');
    }

    // Override the callback
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: onSuccess,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'rectangular',
      text: 'signin_with',
      width: '100%',
    });
  }

  async verifyToken(credential: string): Promise<GoogleUser> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.GOOGLE_AUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: credential,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google authentication failed');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw error;
    }
  }
}

export const googleAuthService = new GoogleAuthService();
