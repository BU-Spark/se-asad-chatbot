import { widgetStyles as styles } from '../Widget.styles';
import { WidgetHeader } from './WidgetHeader';

interface ErrorPanelProps {
  error: string;
  onClose: () => void;
}

export function ErrorPanel({ error, onClose }: ErrorPanelProps) {
  return (
    <>
      <WidgetHeader title="Error" onClose={onClose} />
      <div style={styles.panelContent}>
        <p>{error}</p>
      </div>
    </>
  );
}
