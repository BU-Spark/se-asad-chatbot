import { widgetStyles as styles } from '../Widget.styles';

interface WidgetHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
}

export function WidgetHeader({ title, onClose, onBack }: WidgetHeaderProps) {
  return (
    <div style={styles.header}>
      <button
        onClick={onBack}
        style={{ ...styles.headerButton, textAlign: 'left', opacity: onBack ? 1 : 0 }}
        disabled={!onBack}
      >
        {'Back'}
      </button>
      <p style={styles.headerTitle}>{title}</p>
      <button onClick={onClose} style={styles.headerButton}>
        X
      </button>
    </div>
  );
}
