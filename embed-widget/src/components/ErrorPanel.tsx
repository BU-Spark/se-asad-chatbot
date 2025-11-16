import { widgetStyles as styles } from '../Widget.styles';
import { WidgetHeader } from './WidgetHeader';

interface ErrorPanelProps {
  error: string;
  onClose: () => void;
}

export function ErrorPanel({ error, onClose }: ErrorPanelProps) {
  return (
    <div style={styles.panel}>
      <WidgetHeader title="Error" onClose={onClose} />
      <div style={styles.panelContent}>
        <p>{error}</p>
      </div>
    </div>
  );
}
