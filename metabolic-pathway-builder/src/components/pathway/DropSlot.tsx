/*
 * A blanked-out position in the pathway.
 *
 * It is a real <button>, so everything works without a pointer: select a token,
 * tab to the slot, press Enter. Dragging is layered on top through the drag
 * context rather than replacing that.
 */
import { useCallback } from 'react';
import type { Slot, Token } from '@/types/session';
import { useDrag } from '@/interaction/DragContext';
import styles from './pathway.module.css';

export type SlotVisualState = 'empty' | 'filled' | 'correct' | 'missed';

const PLACEHOLDER: Record<Slot['kind'], string> = {
  metabolite: 'Metabolite',
  enzyme: 'Enzyme',
  energy: 'ATP / ADP',
  redox: 'Redox cofactor',
};

export function DropSlot({
  slot,
  token,
  state,
  active,
  wrong,
  shakeKey,
  onActivate,
  onClear,
}: {
  slot: Slot;
  token?: Token;
  state: SlotVisualState;
  active: boolean;
  /** Last placement in this slot was wrong — replays the shake animation. */
  wrong?: boolean;
  /** Changes on every wrong attempt so the shake animation replays. */
  shakeKey?: number;
  onActivate: () => void;
  onClear?: () => void;
}) {
  const { dragging, overSlotId, selectedTokenId, registerSlot, dropSelected } = useDrag();

  const ref = useCallback(
    (element: HTMLButtonElement | null) => registerSlot(slot.id, element),
    [registerSlot, slot.id],
  );

  const over = Boolean(dragging && dragging.kind === slot.kind && overSlotId === slot.id);
  // Token ids are "<kind>:<entity>", so a selected token reveals its own kind.
  const carrying = dragging?.kind ?? (selectedTokenId?.split(':')[0] as Slot['kind'] | undefined);
  const armed = carrying === slot.kind && state !== 'correct';

  const sizeClass =
    slot.kind === 'metabolite'
      ? styles.slotMetabolite
      : slot.kind === 'enzyme'
        ? styles.slotEnzyme
        : styles.slotCouple;

  const classes = [
    styles.slot,
    sizeClass,
    state === 'filled' ? styles.slotFilled : '',
    state === 'correct' ? styles.slotCorrect : '',
    state === 'missed' ? styles.slotMissed : '',
    active && state === 'empty' ? styles.slotActive : '',
    wrong ? styles.slotWrong : '',
    over ? styles.slotOver : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (state === 'correct') return;
    if (selectedTokenId) {
      dropSelected(slot.id);
      return;
    }
    if (state === 'filled' && onClear) {
      onClear();
      return;
    }
    onActivate();
  };

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      onClick={handleClick}
      aria-label={token ? `${slot.prompt} — ${token.label} placed` : slot.prompt}
      data-slot={slot.id}
      data-slot-kind={slot.kind}
      data-armed={armed ? 'true' : undefined}
      key={shakeKey}
    >
      {token ? (
        <>
          <span className={styles.slotContent}>{token.label}</span>
          {token.sublabel ? <span className={styles.slotSub}>{token.sublabel}</span> : null}
          {state === 'filled' && onClear ? <span className={styles.slotClear}>tap to remove</span> : null}
          {state === 'missed' ? <span className={styles.slotClear}>correct answer</span> : null}
        </>
      ) : (
        <>
          <span className={styles.slotLabel}>{PLACEHOLDER[slot.kind]}</span>
          <span className={styles.slotHint}>{active ? 'drop here' : 'drag or tap'}</span>
        </>
      )}
    </button>
  );
}
