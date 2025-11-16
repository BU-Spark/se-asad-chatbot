import { widgetStyles as styles } from '../Widget.styles';
import type { ChatbotConfig } from '../Widget.types';
import { WidgetHeader } from './WidgetHeader';

interface ChatListViewProps {
  chatbots: ChatbotConfig[];
  onSelectChatbot: (bot: ChatbotConfig) => void;
  onClose: () => void;
}

export function ChatListView({ chatbots, onSelectChatbot, onClose }: ChatListViewProps) {
  return (
    <div style={styles.panel}>
      <WidgetHeader title="Conversations" onClose={onClose} />
      <div style={styles.chatList}>
        {chatbots.map((bot) => (
          <div
            key={bot.id}
            onClick={() => onSelectChatbot(bot)}
            style={styles.chatListItem}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={styles.chatListIcon}>{bot.icon || ' '}</span>
            <span style={styles.chatListName}>{bot.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
