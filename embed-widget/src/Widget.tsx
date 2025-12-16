import { useState, useCallback, useRef } from 'react';
import type { WidgetProps } from './Widget.types';
import { widgetStyles as styles } from './Widget.styles';

import { useChatbotGroup } from './hooks/useChatbotGroup';

import { WidgetLauncher } from './components/WidgetLauncher';
import { LoadingPanel } from './components/LoadingPanel';
import { ErrorPanel } from './components/ErrorPanel';
import { ChatView } from './components/ChatView';

export function Widget({ groupId, apiBaseUrl }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const { isLoading, error } = useChatbotGroup(groupId, apiBaseUrl);

  const STORAGE_KEY = `chatbot-group_${groupId}`;
  const SESSION_KEY = `${STORAGE_KEY}_session`;

  const initializationRef = useRef(false);

  const openChat = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    setIsOpen(true);
    setIsInitializing(true);
    setInitError(null);

    try {
      // Check if we already have a conversation ID
      let existingConversationId: string | null = null;
      try {
        existingConversationId = sessionStorage.getItem(SESSION_KEY);
        console.log('Existing conversation ID:', existingConversationId);
      } catch (e) {
        console.error('Failed to read sessionStorage:', e);
      }

      if (existingConversationId) {
        // Verify it exists on the backend
        const verifyResponse = await fetch(
          `${apiBaseUrl}/api/chatbot-groups/${groupId}/conversations/${existingConversationId}`
        );

        console.log('Verify response status:', verifyResponse.status);

        if (verifyResponse.ok) {
          console.log('Using existing conversation:', existingConversationId);
          setConversationId(existingConversationId);
          return;
        } else {
          console.log('Invalid conversation, removing from storage');
          try {
            sessionStorage.removeItem(SESSION_KEY);
          } catch (e) {
            console.error('Failed to remove from sessionStorage:', e);
          }
        }
      }

      // Create new conversation with intro message
      console.log('Creating new conversation...');
      const response = await fetch(`${apiBaseUrl}/api/chatbot-groups/${groupId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialMessage: {
            role: 'assistant',
            content: 'Hello! How can I help you today?',
          },
        }),
      });

      console.log('Create conversation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create conversation:', errorText);
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      console.log('Created conversation:', data);

      if (!data.conversation_id) {
        throw new Error('No conversation_id in response');
      }

      setConversationId(data.conversation_id);

      // Save to sessionStorage
      try {
        sessionStorage.setItem(SESSION_KEY, data.conversation_id);
        console.log('Saved conversation ID to sessionStorage');
      } catch (e) {
        console.error('Failed to save to sessionStorage:', e);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize chat');
    } finally {
      setIsInitializing(false);
      initializationRef.current = false;
    }
  }, [groupId, SESSION_KEY, apiBaseUrl]);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setConversationId(null);
    setInitError(null);
  }, []);

  const canShowLauncher = !isLoading;

  return (
    <div style={styles.container}>
      {!isOpen && canShowLauncher && <WidgetLauncher onClick={openChat} />}

      {isOpen && (
        <div style={{ ...styles.panel, position: 'relative' }}>
          {/* Show loading/error panels */}
          {(isLoading || isInitializing) && <LoadingPanel onClose={closeWidget} />}
          {(error || initError) && <ErrorPanel error={error || initError || 'Unknown error'} onClose={closeWidget} />}

          {/* Show chat view when ready */}
          {!isLoading && !error && !isInitializing && !initError && conversationId && (
            <ChatView groupId={groupId} conversationId={conversationId} apiBaseUrl={apiBaseUrl} onClose={closeWidget} />
          )}
        </div>
      )}
    </div>
  );
}
