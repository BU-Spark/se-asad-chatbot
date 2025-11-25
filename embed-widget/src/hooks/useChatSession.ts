import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { DeepChatRequestBody, DeepChatResponseSignals, MessageContent } from '../Widget.types';

interface BackendMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChatSession(groupId: string, storageKey: string) {
  const sessionKey = useMemo(() => `${storageKey}_session`, [storageKey]);

  const [initialMessages, setInitialMessages] = useState<MessageContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    const fetchConversationHistory = async () => {
      setIsLoadingHistory(true);
      try {
        let storedConversationId: string | null = null;
        try {
          storedConversationId = sessionStorage.getItem(sessionKey);
        } catch (storageError) {
          console.error('Failed to read from sessionStorage:', storageError);
        }

        if (storedConversationId) {
          const url = `http://localhost:3000/api/chatbot-groups/${groupId}/conversations/${storedConversationId}`;

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
              // Invalid conversation ID, remove it
              try {
                sessionStorage.removeItem(sessionKey);
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
  }, [groupId, sessionKey]);

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
        // Backend will route to appropriate chatbot based on message content
        const response = await fetch(`http://localhost:3000/api/chatbot-groups/${groupId}/prompt`, {
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

        // Save conversation ID for future requests
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
          conversationIdRef.current = data.conversation_id;

          try {
            sessionStorage.setItem(sessionKey, data.conversation_id);
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
    [groupId, sessionKey]
  );

  return { initialMessages, chatHandler, isLoadingHistory };
}
