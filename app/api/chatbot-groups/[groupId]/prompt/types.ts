export interface ChatbotGroup {
  id: string;
  assistant_ids: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  chatbot_id: string;
  messages: Message[];
}

export interface ChatbotWithDescription {
  id: string;
  name: string;
  description: string;
}

export const CLARIFICATION_BOT_ID = '__clarification_bot__';

export const CONFIDENCE_THRESHOLD = 0.65;
