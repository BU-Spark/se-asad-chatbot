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
    <>
      <WidgetHeader title="Conversations" onClose={onClose} />
      <div style={styles.chatList}>
        {chatbots.map((bot) => (
          <button
            key={bot.id}
            onClick={() => onSelectChatbot(bot)}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            style={styles.chatListItem}
            type="button"
          >
            <span style={styles.chatListIcon}>{bot.icon || ' '}</span>
            <span style={styles.chatListName}>{bot.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}
