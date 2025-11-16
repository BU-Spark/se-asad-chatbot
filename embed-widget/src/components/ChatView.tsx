import { DeepChat } from 'deep-chat-react';
import { widgetStyles as styles } from '../Widget.styles';
import type { ChatbotConfig, DeepChatRequestBody, DeepChatResponseSignals } from '../Widget.types';
import { WidgetHeader } from './WidgetHeader';

interface ChatViewProps {
  activeChatbot: ChatbotConfig;
  chatHandler: (body: DeepChatRequestBody, signals: DeepChatResponseSignals) => Promise<void>;
  onBack: () => void;
  onClose: () => void;
}

export function ChatView({ activeChatbot, chatHandler, onBack, onClose }: ChatViewProps) {
  return (
    <div style={styles.panel}>
      <WidgetHeader title={activeChatbot.name} onBack={onBack} onClose={onClose} />
      <div style={styles.chatContainer}>
        <DeepChat
          key={activeChatbot.id}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          connect={{ handler: chatHandler }}
          introMessage={{ text: activeChatbot.intro }}
        />
      </div>
    </div>
  );
}
