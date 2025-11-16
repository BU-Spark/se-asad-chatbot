import { useState } from 'react';
import type { ChatbotConfig, WidgetProps, WidgetView } from './Widget.types';
import { widgetStyles as styles } from './Widget.styles';

import { useChatbotGroup } from './hooks/useChatbotGroup';
import { useChatHandler } from './hooks/useChatbotHandler';

import { WidgetLauncher } from './components/WidgetLauncher';
import { LoadingPanel } from './components/LoadingPanel';
import { ErrorPanel } from './components/ErrorPanel';
import { ChatListView } from './components/ChatListView';
import { ChatView } from './components/ChatView';

export function Widget({ groupId }: WidgetProps) {
  const [view, setView] = useState<WidgetView>('closed');
  const [activeChatbot, setActiveChatbot] = useState<ChatbotConfig | null>(null);

  // Custom hook for fetching chatbot data
  const { chatbots, isLoading, error } = useChatbotGroup(groupId);

  // Custom hook for handling chat logic
  const STORAGE_KEY = `chatbot-group-sessions_${groupId}`;
  const { chatHandler } = useChatHandler(activeChatbot, STORAGE_KEY);

  // View navigation callbacks
  const openChatList = () => setView('list');
  const closeWidget = () => setView('closed');

  const selectChatbot = (bot: ChatbotConfig) => {
    setActiveChatbot(bot);
    setView('chat');
  };

  const goBackToList = () => {
    setActiveChatbot(null);
    setView('list');
  };

  const canShowLauncher = !isLoading && !error;

  return (
    <div style={styles.container}>
      {/* View: Closed (Launcher Button) */}
      {view === 'closed' && canShowLauncher && <WidgetLauncher onClick={openChatList} />}

      {/* View: Open (Panel) */}
      {view !== 'closed' && (
        <>
          {isLoading && <LoadingPanel onClose={closeWidget} />}
          {error && <ErrorPanel error={error} onClose={closeWidget} />}

          {!isLoading && !error && view === 'list' && chatbots && (
            <ChatListView chatbots={chatbots} onSelectChatbot={selectChatbot} onClose={closeWidget} />
          )}

          {!isLoading && !error && view === 'chat' && activeChatbot && (
            <ChatView
              activeChatbot={activeChatbot}
              chatHandler={chatHandler}
              onBack={goBackToList}
              onClose={closeWidget}
            />
          )}
        </>
      )}
    </div>
  );
}
