import { useMemo, useRef } from 'react';
import { DeepChat } from 'deep-chat-react';
import type { DeepChat as DeepChatType } from 'deep-chat';
import { widgetStyles as styles } from '../Widget.styles';
import { WidgetHeader } from './WidgetHeader';
import { useChatSession } from '../hooks/useChatSession';

interface ChatViewProps {
  groupId: string;
  conversationId: string;
  apiBaseUrl: string;
  onClose: () => void;
}

export function ChatView({ groupId, conversationId, apiBaseUrl, onClose }: ChatViewProps) {
  const { initialMessages, chatHandler, isLoadingHistory } = useChatSession(groupId, conversationId, apiBaseUrl);

  const deepChatRef = useRef<DeepChatType | null>(null);

  const deepChatStyles = useMemo(
    () =>
      ({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
      }) as const,
    []
  );

  const connectConfig = useMemo(
    () => ({
      handler: chatHandler,
    }),
    [chatHandler]
  );

  if (isLoadingHistory) {
    return (
      <>
        <WidgetHeader title="Chat" onClose={onClose} />
        <div style={styles.chatContainer}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: 'white',
            }}
          >
            <p>Loading conversation...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <WidgetHeader title="Chat" onClose={onClose} />
      <div style={styles.chatContainer}>
        <DeepChat ref={deepChatRef} style={deepChatStyles} connect={connectConfig} history={initialMessages} />
      </div>
    </>
  );
}
