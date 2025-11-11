/**
 * Types for Conversation context summarization
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Summary {
  message_range: string; // e.g., "0-4"
  summary: string;
  created_at: string; // ISO timestamp
}

export interface SummariesData {
  last_processed_index: number;
  summaries: Summary[];
}

export interface Conversation {
  id: string;
  created_at: string;
  user_id: string | null;
  chatbot_id: string | null;
  messages: Message[] | null;
  summaries: SummariesData | null;
}

export interface ConversationUpdatePayload {
  id: string;
  summaries: SummariesData;
}
