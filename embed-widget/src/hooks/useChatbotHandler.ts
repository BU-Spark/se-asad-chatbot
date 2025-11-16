import { useRef, useEffect, useCallback } from 'react';
import type { ChatbotConfig, DeepChatRequestBody, DeepChatResponseSignals } from '../Widget.types';

export function useChatHandler(activeChatbot: ChatbotConfig | null, STORAGE_KEY: string) {
  const activeChatbotRef = useRef<ChatbotConfig | null>(activeChatbot);
  const conversationIdsRef = useRef<Record<string, string | null>>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  );

  useEffect(() => {
    activeChatbotRef.current = activeChatbot;
  }, [activeChatbot]);

  const chatHandler = useCallback(
    async (body: DeepChatRequestBody, signals: DeepChatResponseSignals) => {
      const currentActiveChatbot = activeChatbotRef.current;
      const currentConversationIds = conversationIdsRef.current;

      if (!currentActiveChatbot) {
        return signals.onResponse({ error: 'No chatbot selected.', role: 'assistant' });
      }

      const chatbotId = currentActiveChatbot.id;
      const userMessage = body.messages[body.messages.length - 1].text;
      const currentConversationId = currentConversationIds[chatbotId] || null;

      try {
        const response = await fetch(`http://localhost:3000/api/chatbots/${chatbotId}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            conversation_id: currentConversationId,
          }),
        });

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();

        if (data.conversation_id) {
          const newIds = {
            ...currentConversationIds,
            [chatbotId]: data.conversation_id,
          };
          conversationIdsRef.current = newIds;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
        }

        signals.onResponse({ text: data.reply, role: 'assistant' });
      } catch (error) {
        console.error(error);
        signals.onResponse({ error: 'Sorry, I had trouble connecting.', role: 'assistant' });
      }
    },
    [STORAGE_KEY]
  );

  return { chatHandler };
}
