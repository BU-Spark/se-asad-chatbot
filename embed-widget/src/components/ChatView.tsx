import { useMemo, useRef } from 'react';
import { DeepChat } from 'deep-chat-react';
import type { DeepChat as DeepChatType } from 'deep-chat';
import { widgetStyles as styles } from '../Widget.styles';
import type { ChatbotConfig } from '../Widget.types';
import { WidgetHeader } from './WidgetHeader';
import { useChatSession } from '../hooks/useChatSession';

interface ChatViewProps {
  activeChatbot: ChatbotConfig;
  storageKey: string;
  onBack: () => void;
  onClose: () => void;
  isActive: boolean;
}

export function ChatView({ activeChatbot, storageKey, onBack, onClose, isActive }: ChatViewProps) {
  const { initialMessages, chatHandler, isLoadingHistory } = useChatSession(activeChatbot, storageKey, isActive);

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

  const introMessage = useMemo(
    () =>
      initialMessages.length === 0
        ? { text: `Hello! I'm ${activeChatbot.name}. how can I help you today?` }
        : undefined,
    [initialMessages.length, activeChatbot.name]
  );

  const historyConfig = useMemo(() => (initialMessages.length > 0 ? initialMessages : undefined), [initialMessages]);

  if (isLoadingHistory) {
    return (
      <>
        <WidgetHeader title={activeChatbot.name} onBack={onBack} onClose={onClose} />
        <div style={styles.chatContainer}>
          <DeepChat ref={deepChatRef} style={deepChatStyles} connect={connectConfig} introMessage={introMessage} />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
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
      <WidgetHeader title={activeChatbot.name} onBack={onBack} onClose={onClose} />
      <div style={styles.chatContainer}>
        <DeepChat
          ref={deepChatRef}
          style={deepChatStyles}
          connect={connectConfig}
          history={historyConfig}
          introMessage={introMessage}
        />
      </div>
    </>
  );
}
