import { useState, useCallback } from 'react';
import type { ChatbotConfig, WidgetProps } from './Widget.types';
import { widgetStyles as styles } from './Widget.styles';

import { useChatbotGroup } from './hooks/useChatbotGroup';

import { WidgetLauncher } from './components/WidgetLauncher';
import { LoadingPanel } from './components/LoadingPanel';
import { ErrorPanel } from './components/ErrorPanel';
import { ChatListView } from './components/ChatListView';
import { ChatView } from './components/ChatView';

export function Widget({ groupId }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatbot, setActiveChatbot] = useState<ChatbotConfig | null>(null);

  // Hook for fetching chatbot data
  const { chatbots, isLoading, error } = useChatbotGroup(groupId);

  // Hook for handling chat logic
  const STORAGE_KEY = `chatbot-group_${groupId}`;

  const openChatList = useCallback(() => setIsOpen(true), []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setActiveChatbot(null);
  }, []);

  const selectChatbot = useCallback((bot: ChatbotConfig) => {
    setActiveChatbot(bot);
  }, []);

  const goBackToList = useCallback(() => {
    setActiveChatbot(null);
  }, []);

  const canShowLauncher = !isLoading;

  return (
    <div style={styles.container}>
      {!isOpen && canShowLauncher && <WidgetLauncher onClick={openChatList} />}

      {isOpen && (
        <div style={{ ...styles.panel, position: 'relative' }}>
          {/* Show loading/error panels */}
          {isLoading && <LoadingPanel onClose={closeWidget} />}
          {error && <ErrorPanel error={error} onClose={closeWidget} />}

          {/* Show chat list when no active chatbot */}
          {!isLoading && !error && chatbots && !activeChatbot && (
            <div style={{ position: 'relative', zIndex: 20, height: '100%', backgroundColor: 'white' }}>
              <ChatListView chatbots={chatbots} onSelectChatbot={selectChatbot} onClose={closeWidget} />
            </div>
          )}

          {/* Renders all ChatViews, hide inactive ones for optimization*/}
          {!isLoading &&
            !error &&
            chatbots &&
            chatbots.map((bot) => (
              <div
                key={bot.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  visibility: activeChatbot?.id === bot.id ? 'visible' : 'hidden',
                  pointerEvents: activeChatbot?.id === bot.id ? 'auto' : 'none',
                  zIndex: activeChatbot?.id === bot.id ? 10 : 1,
                }}
              >
                <ChatView
                  activeChatbot={bot}
                  storageKey={STORAGE_KEY}
                  onBack={goBackToList}
                  onClose={closeWidget}
                  isActive={activeChatbot?.id === bot.id}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
