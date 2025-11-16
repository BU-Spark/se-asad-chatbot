import { widgetStyles as styles } from '../Widget.styles';
import { WidgetHeader } from './WidgetHeader';

interface LoadingPanelProps {
  onClose: () => void;
}

export function LoadingPanel({ onClose }: LoadingPanelProps) {
  return (
    <div style={styles.panel}>
      <WidgetHeader title="Loading..." onClose={onClose} />
      <div style={styles.panelContent}>
        <p>Please wait...</p>
      </div>
    </div>
  );
}
