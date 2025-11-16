import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ChatbotConfig, DeepChatRequestBody, DeepChatResponseSignals, MessageContent } from '../Widget.types';

interface BackendMessage {
  role: 'user' | 'assistant';
  content?: string;
  text?: string;
  message?: string;
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
        const storedConversationIds = JSON.parse(localStorage.getItem(sessionKey) || '{}');
        const storedConversationId = storedConversationIds[chatbot.id] || null;

        console.log('Fetching conversation for chatbot:', chatbot.id, 'conversationId:', storedConversationId);

        if (storedConversationId) {
          const url = `http://localhost:3000/api/chatbots/${chatbot.id}/conversations/${storedConversationId}`;
          console.log('Fetching from:', url);

          const response = await fetch(url);

          console.log('Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Conversation data received:', data);

            const messages: MessageContent[] = (data.messages || []).map((msg: BackendMessage) => ({
              role: msg.role,
              text: msg.content || msg.text || msg.message,
            }));

            console.log('Transformed messages:', messages);
            console.log('Setting initial messages and conversation ID');

            setInitialMessages(messages);
            setConversationId(storedConversationId);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to fetch conversation:', response.status, errorData);
            console.error('Failed URL was:', url);

            const newIds = { ...storedConversationIds };
            delete newIds[chatbot.id];
            localStorage.setItem(sessionKey, JSON.stringify(newIds));
            setInitialMessages([]);
            setConversationId(null);
          }
        } else {
          console.log('No stored conversation ID found');
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
      console.log('Sending message:', userMessage.text, 'with conversationId:', currentConversationId);

      try {
        const response = await fetch(`http://localhost:3000/api/chatbots/${chatbot.id}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.text,
            conversation_id: currentConversationId,
          }),
        });

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();

        console.log('Received response:', data);

        signals.onResponse({ text: data.reply, role: 'assistant' });

        if (data.conversation_id) {
          console.log('Updating conversation ID to:', data.conversation_id);
          setConversationId(data.conversation_id);
          conversationIdRef.current = data.conversation_id;

          const storedConversationIds = JSON.parse(localStorage.getItem(sessionKey) || '{}');
          const newIds = { ...storedConversationIds, [chatbot.id]: data.conversation_id };
          localStorage.setItem(sessionKey, JSON.stringify(newIds));
        }
      } catch (error) {
        console.error('Chat handler error:', error);
        signals.onResponse({ error: 'Sorry, I had trouble connecting.', role: 'assistant' });
      }
    },
    [chatbot.id, sessionKey]
  );

  return { initialMessages, chatHandler, isLoadingHistory };
}
