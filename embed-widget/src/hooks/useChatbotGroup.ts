import { useState, useEffect } from 'react';
import type { ChatbotConfig } from '../Widget.types';

export function useChatbotGroup(groupId: string) {
  const [chatbots, setChatbots] = useState<ChatbotConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatbotConfig = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/chatbot-groups/${groupId}/fetch-data`);

        if (!response.ok) {
          throw new Error('Failed to load chatbot configuration.');
        }
        const data: ChatbotConfig[] = await response.json();

        if (!data || data.length === 0) {
          throw new Error('No chatbots found for this group.');
        }
        setChatbots(data);
      } catch (e: unknown) {
        console.error(e);

        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbotConfig();
  }, [groupId]);

  return { chatbots, isLoading, error };
}
