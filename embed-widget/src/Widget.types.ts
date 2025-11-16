export interface ChatbotConfig {
  id: string;
  name: string;
  intro: string;
  icon?: string;
}

export interface WidgetProps {
  groupId: string;
}

export interface DeepChatRequestBody {
  messages: {
    text: string;
    role: 'user' | 'assistant' | 'system';
  }[];
}

export interface DeepChatResponseSignals {
  onResponse: (response: { text?: string; error?: string; role: 'assistant' }) => void;
}

export type WidgetView = 'closed' | 'list' | 'chat';
