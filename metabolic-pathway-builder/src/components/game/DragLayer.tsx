import { useDrag } from '@/interaction/DragContext';
import { TokenChip } from './TokenTray';
import styles from './game.module.css';

/** The card that follows the finger or the cursor while dragging. */
export function DragLayer() {
  const { dragging, pointer } = useDrag();
  if (!dragging || !pointer) return null;
  return (
    <div className={styles.ghost} style={{ left: pointer.x, top: pointer.y }}>
      <TokenChip token={dragging} />
    </div>
  );
}
