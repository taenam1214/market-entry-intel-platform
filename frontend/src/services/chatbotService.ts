
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface MarketReport {
  id: number;
  analysis_id: string;
  analysis_type: string;
  status: string;
  company_name: string;
  industry: string;
  target_market: string;
  executive_summary: string;
  created_at: string;
  completed_at: string;
}

interface ChatMessage {
  id: number;
  message_type: 'user' | 'assistant';
  content: string;
  sources: string[];
  created_at: string;
}

interface ChatConversation {
  id: number;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

interface SendMessageRequest {
  content: string;
  conversation_id?: number;
  selected_report_ids?: number[];
}

interface SendMessageResponse {
  conversation_id: number;
  user_message: ChatMessage;
  ai_message: ChatMessage;
}

class ChatbotService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getMarketReports(): Promise<{ reports: MarketReport[]; count: number }> {
    return this.makeRequest<{ reports: MarketReport[]; count: number }>('/reports/');
  }

  async getConversations(): Promise<{ conversations: ChatConversation[]; count: number }> {
    return this.makeRequest<{ conversations: ChatConversation[]; count: number }>('/chat/conversations/');
  }

  async createConversation(title?: string): Promise<ChatConversation> {
    return this.makeRequest<ChatConversation>('/chat/conversations/', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.makeRequest<SendMessageResponse>('/chat/messages/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatHistory(conversationId: number): Promise<{ conversation: ChatConversation; messages: ChatMessage[] }> {
    return this.makeRequest<{ conversation: ChatConversation; messages: ChatMessage[] }>(`/chat/conversations/${conversationId}/`);
  }
}

export const chatbotService = new ChatbotService();
export type { MarketReport, ChatMessage, ChatConversation, SendMessageRequest, SendMessageResponse };
