import { useState, useCallback } from 'react';
import type { WidgetProps } from './Widget.types';
import { widgetStyles as styles } from './Widget.styles';

import { useChatbotGroup } from './hooks/useChatbotGroup';

import { WidgetLauncher } from './components/WidgetLauncher';
import { LoadingPanel } from './components/LoadingPanel';
import { ErrorPanel } from './components/ErrorPanel';
import { ChatView } from './components/ChatView';

export function Widget({ groupId }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { isLoading, error } = useChatbotGroup(groupId);

  const STORAGE_KEY = `chatbot-group_${groupId}`;

  const openChat = useCallback(() => setIsOpen(true), []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
  }, []);

  const canShowLauncher = !isLoading;

  return (
    <div style={styles.container}>
      {!isOpen && canShowLauncher && <WidgetLauncher onClick={openChat} />}

      {isOpen && (
        <div style={{ ...styles.panel, position: 'relative' }}>
          {/* Show loading/error panels */}
          {isLoading && <LoadingPanel onClose={closeWidget} />}
          {error && <ErrorPanel error={error} onClose={closeWidget} />}

          {/* Show single chat view when ready */}
          {!isLoading && !error && <ChatView groupId={groupId} storageKey={STORAGE_KEY} onClose={closeWidget} />}
        </div>
      )}
    </div>
  );
}
