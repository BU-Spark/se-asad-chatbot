import { useState, useEffect } from 'react';

export function useChatbotGroup(groupId: string, apiBaseUrl: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateGroup = async () => {
      if (!apiBaseUrl) return;

      try {
        // Only for validating
        const response = await fetch(`${apiBaseUrl}/api/chatbot-groups/${groupId}/validate`);

        if (!response.ok) {
          throw new Error('Invalid chatbot group.');
        }
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

    validateGroup();
  }, [groupId, apiBaseUrl]);

  return { isLoading, error };
}
