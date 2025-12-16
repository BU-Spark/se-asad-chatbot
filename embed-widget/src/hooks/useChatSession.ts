import { useState, useCallback, useEffect } from 'react';
import type { DeepChatRequestBody, DeepChatResponseSignals, MessageContent } from '../Widget.types';

interface BackendMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChatSession(groupId: string, conversationId: string, apiBaseUrl: string) {
  const [initialMessages, setInitialMessages] = useState<MessageContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchConversationHistory = async () => {
      if (!apiBaseUrl) return;

      setIsLoadingHistory(true);
      try {
        const url = `${apiBaseUrl}/api/chatbot-groups/${groupId}/conversations/${conversationId}`;

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 10000);

        try {
          const response = await fetch(url, {
            signal: abortController.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();

            const messages: MessageContent[] = (data.messages || []).map((msg: BackendMessage) => ({
              role: msg.role,
              text: msg.content,
            }));

            setInitialMessages(messages);
          } else {
            console.error('Failed to fetch conversation history');
            setInitialMessages([]);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if ((fetchError as Error).name === 'AbortError') {
            console.error('Conversation fetch timed out');
          }
          throw fetchError;
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
        setInitialMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchConversationHistory();
  }, [groupId, conversationId, apiBaseUrl]);

  const chatHandler = useCallback(
    async (body: DeepChatRequestBody, signals: DeepChatResponseSignals) => {
      const lastMessageFromChat = body.messages[body.messages.length - 1];
      const userMessage: MessageContent = {
        role: 'user',
        text: lastMessageFromChat.text,
      };

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000);

      try {
        const response = await fetch(`${apiBaseUrl}/api/chatbot-groups/${groupId}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.text,
            conversation_id: conversationId,
          }),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();

        if (!data || typeof data.reply !== 'string') {
          throw new Error('Invalid response format');
        }

        signals.onResponse({ text: data.reply, role: 'assistant' });
      } catch (error) {
        clearTimeout(timeoutId);

        if ((error as Error).name === 'AbortError') {
          console.error('Chat request timed out');
          signals.onResponse({ error: 'Request timed out. Please try again.', role: 'assistant' });
        } else {
          console.error('Chat handler error:', error);
          signals.onResponse({ error: 'Sorry, I had trouble connecting.', role: 'assistant' });
        }
      }
    },
    [groupId, conversationId, apiBaseUrl]
  );

  return { initialMessages, chatHandler, isLoadingHistory };
}
