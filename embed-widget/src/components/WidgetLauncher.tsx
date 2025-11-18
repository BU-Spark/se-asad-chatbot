import { widgetStyles as styles } from '../Widget.styles';

interface WidgetLauncherProps {
  onClick: () => void;
}

export function WidgetLauncher({ onClick }: WidgetLauncherProps) {
  return (
    <button onClick={onClick} style={styles.launcherButton}>
      {/* can add some img/icon */}
    </button>
  );
}
