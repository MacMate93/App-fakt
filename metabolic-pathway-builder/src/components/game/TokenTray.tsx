/*
 * The tray of draggable answers.
 *
 * Tokens are grouped by category so that the tray reads as a legend as well as
 * a palette: metabolites in one row, enzymes in the next, energy and redox
 * chips after them.
 */
import type { MouseEvent, PointerEvent } from 'react';
import type { SlotKind, Token } from '@/types/session';
import { useDrag } from '@/interaction/DragContext';
import styles from './game.module.css';

const GROUP_LABEL: Record<SlotKind, string> = {
  metabolite: 'Metabolites',
  enzyme: 'Enzymes',
  energy: 'Energy carriers',
  redox: 'Redox cofactors',
};

const GROUP_ORDER: SlotKind[] = ['metabolite', 'enzyme', 'energy', 'redox'];

export const tokenClass = (kind: SlotKind): string =>
  ({
    metabolite: styles.tokenMetabolite,
    enzyme: styles.tokenEnzyme,
    energy: styles.tokenEnergy,
    redox: styles.tokenRedox,
  })[kind];

export function TokenChip({
  token,
  remaining,
  selected,
  onPointerDown,
  onKeyboardSelect,
}: {
  token: Token;
  remaining?: number;
  selected?: boolean;
  onPointerDown?: (event: PointerEvent) => void;
  onKeyboardSelect?: () => void;
}) {
  const classes = [styles.token, tokenClass(token.kind), selected ? styles.tokenSelected : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      data-draggable="true"
      aria-pressed={selected}
      onPointerDown={onPointerDown}
      onClick={(event: MouseEvent) => {
        // Pointer taps are handled by the drag layer; detail === 0 means the
        // click came from the keyboard, which still has to work.
        if (event.detail === 0) onKeyboardSelect?.();
      }}
    >
      <span>
        {token.label}
        {remaining !== undefined && remaining > 1 ? (
          <span className={styles.tokenCount}> ×{remaining}</span>
        ) : null}
      </span>
      {token.sublabel ? <span className={styles.tokenSub}>{token.sublabel}</span> : null}
    </button>
  );
}

export function TokenTray({
  tokens,
  availability,
  hint,
}: {
  tokens: Token[];
  availability: Record<string, number>;
  hint?: string;
}) {
  const { selectedTokenId, selectToken, startDrag } = useDrag();
  const visible = tokens.filter((token) => (availability[token.id] ?? 0) > 0);

  return (
    <div className={styles.tray}>
      <div className={styles.trayHead}>
        <span>Drag a card into a blank position — or tap it, then tap the position.</span>
        <span>{visible.length} left</span>
      </div>
      <div className={styles.trayGroups}>
        {GROUP_ORDER.map((kind) => {
          const group = visible.filter((token) => token.kind === kind);
          if (group.length === 0) return null;
          return (
            <div className={styles.trayGroup} key={kind}>
              <span className={styles.trayGroupLabel}>{GROUP_LABEL[kind]}</span>
              {group.map((token) => (
                <TokenChip
                  key={token.id}
                  token={token}
                  remaining={availability[token.id]}
                  selected={selectedTokenId === token.id}
                  onPointerDown={(event) => startDrag(token, event)}
                  onKeyboardSelect={() => selectToken(token.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
      {hint ? <div className={styles.trayHead}>{hint}</div> : null}
    </div>
  );
}
