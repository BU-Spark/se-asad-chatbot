import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ChatbotConfig, DeepChatRequestBody, DeepChatResponseSignals, MessageContent } from '../Widget.types';

interface BackendMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChatSession(chatbot: ChatbotConfig, storageKey: string, isActive: boolean) {
  const sessionKey = useMemo(() => `${storageKey}_session`, [storageKey]);

  const [initialMessages, setInitialMessages] = useState<MessageContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const lastActiveRef = useRef(isActive);

  useEffect(() => {
    const isBecomingActive = isActive && !lastActiveRef.current;
    const isInitialMount = !hasLoadedRef.current && isActive;

    lastActiveRef.current = isActive;

    if (!isBecomingActive && !isInitialMount) {
      return;
    }

    const fetchConversationHistory = async () => {
      setIsLoadingHistory(true);
      try {
        let storedConversationIds: Record<string, string> = {};
        try {
          storedConversationIds = JSON.parse(sessionStorage.getItem(sessionKey) || '{}');
        } catch (storageError) {
          console.error('Failed to read from sessionStorage:', storageError);
        }

        const storedConversationId = storedConversationIds[chatbot.id] || null;

        if (storedConversationId) {
          const url = `http://localhost:3000/api/chatbots/${chatbot.id}/conversations/${storedConversationId}`;

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
              setConversationId(storedConversationId);
            } else {
              try {
                const newIds = { ...storedConversationIds };
                delete newIds[chatbot.id];
                sessionStorage.setItem(sessionKey, JSON.stringify(newIds));
              } catch (storageError) {
                console.error('Failed to update sessionStorage:', storageError);
              }
              setInitialMessages([]);
              setConversationId(null);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            if ((fetchError as Error).name === 'AbortError') {
              console.error('Conversation fetch timed out');
            }
            throw fetchError;
          }
        } else {
          setInitialMessages([]);
          setConversationId(null);
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
        setInitialMessages([]);
        setConversationId(null);
      } finally {
        setIsLoadingHistory(false);
        hasLoadedRef.current = true;
      }
    };

    fetchConversationHistory();
  }, [chatbot.id, sessionKey, isActive]);

  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const chatHandler = useCallback(
    async (body: DeepChatRequestBody, signals: DeepChatResponseSignals) => {
      const lastMessageFromChat = body.messages[body.messages.length - 1];
      const userMessage: MessageContent = {
        role: 'user',
        text: lastMessageFromChat.text,
      };

      const currentConversationId = conversationIdRef.current;

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000);

      try {
        const response = await fetch(`http://localhost:3000/api/chatbots/${chatbot.id}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.text,
            conversation_id: currentConversationId,
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

        if (data.conversation_id) {
          setConversationId(data.conversation_id);
          conversationIdRef.current = data.conversation_id;

          try {
            const storedConversationIds: Record<string, string> = JSON.parse(
              sessionStorage.getItem(sessionKey) || '{}'
            );
            const newIds = { ...storedConversationIds, [chatbot.id]: data.conversation_id };
            sessionStorage.setItem(sessionKey, JSON.stringify(newIds));
          } catch (storageError) {
            console.error('Failed to save conversation ID to sessionStorage:', storageError);
          }
        }
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
    [chatbot.id, sessionKey]
  );

  return { initialMessages, chatHandler, isLoadingHistory };
}
