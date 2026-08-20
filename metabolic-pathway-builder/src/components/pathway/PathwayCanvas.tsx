/*
 * The pathway itself.
 *
 * The same component renders Explore (everything visible, everything
 * clickable), the play canvas (some positions replaced by drop slots) and the
 * exam review (right and wrong placements marked). It reads the layout from the
 * pathway data through buildCanvasModel — it knows nothing about glycolysis.
 */
import { Fragment, useEffect, useMemo, useRef } from 'react';
import type { Reaction } from '@/types/pathway';
import type { Slot, SlotResult, Token } from '@/types/session';
import {
  buildCanvasModel,
  factorOf,
  splitRowsIntoColumns,
  type CanvasNode,
  type PathwayIndex,
} from '@/engine/pathwayModel';
import { CoupleChip } from './CoupleChip';
import { DropSlot, type SlotVisualState } from './DropSlot';
import { EnzymePill } from './EnzymePill';
import { MetaboliteCard } from './MetaboliteCard';
import styles from './pathway.module.css';

export type CanvasSelection = { kind: 'metabolite' | 'enzyme' | 'couple'; id: string } | null;

interface PathwayCanvasProps {
  index: PathwayIndex;
  slots?: Slot[];
  placements?: Record<string, string | undefined>;
  results?: Record<string, SlotResult>;
  tokens?: Token[];
  activeSlotId?: string | null;
  /** Exam review: mark what was right and wrong instead of accepting input. */
  review?: boolean;
  wrongSlotId?: string | null;
  onSlotActivate?: (slotId: string) => void;
  onSlotClear?: (slotId: string) => void;
  onSelect?: (selection: NonNullable<CanvasSelection>) => void;
  selection?: CanvasSelection;
  /** How many vertical columns to break the pathway into. */
  columns?: number;
  /** 1 = full size. Shrinks the whole diagram so a long pathway fits. */
  zoom?: number;
}

export function PathwayCanvas({
  index,
  slots = [],
  placements = {},
  results = {},
  tokens = [],
  activeSlotId = null,
  review = false,
  wrongSlotId = null,
  onSlotActivate,
  onSlotClear,
  onSelect,
  selection = null,
  columns = 1,
  zoom = 1,
}: PathwayCanvasProps) {
  const model = useMemo(() => buildCanvasModel(index.pathway), [index]);
  const groups = useMemo(() => splitRowsIntoColumns(model.rows, columns), [model.rows, columns]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Follow the current task rather than making the student look for it. "nearest"
  // keeps a slot that is already on screen exactly where it is.
  useEffect(() => {
    if (!activeSlotId) return;
    const element = canvasRef.current?.querySelector(`[data-slot="${activeSlotId}"]`);
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [activeSlotId]);
  const slotById = useMemo(() => new Map(slots.map((slot) => [slot.id, slot])), [slots]);
  const tokenById = useMemo(() => new Map(tokens.map((token) => [token.id, token])), [tokens]);

  const visualState = (slot: Slot): SlotVisualState => {
    const result = results[slot.id];
    if (result?.solved) return 'correct';
    if (review) return 'missed';
    return placements[slot.id] ? 'filled' : 'empty';
  };

  const renderSlot = (slot: Slot) => {
    const state = visualState(slot);
    // In review, a position the student did not solve shows the right answer.
    const placedId = state === 'missed' ? slot.answerTokenIds[0] : placements[slot.id];
    return (
      <DropSlot
        slot={slot}
        token={placedId ? tokenById.get(placedId) : undefined}
        state={state}
        active={activeSlotId === slot.id}
        wrong={wrongSlotId === slot.id}
        shakeKey={results[slot.id]?.attempts ?? 0}
        onActivate={() => onSlotActivate?.(slot.id)}
        onClear={onSlotClear ? () => onSlotClear(slot.id) : undefined}
      />
    );
  };

  const renderNode = (node: CanvasNode, multiplier: number) => {
    const slot = slotById.get(`${node.reactionId}:node:${node.index}`);
    const solved = slot ? Boolean(results[slot.id]?.solved) : false;
    if (slot && !solved) return <Fragment key={node.key}>{renderSlot(slot)}</Fragment>;

    const metabolite = index.metabolites.get(node.metaboliteId);
    if (!metabolite) return null;
    return (
      <MetaboliteCard
        key={node.key}
        metabolite={metabolite}
        multiplier={multiplier}
        solved={solved}
        selected={selection?.kind === 'metabolite' && selection.id === metabolite.id}
        onClick={onSelect ? () => onSelect({ kind: 'metabolite', id: metabolite.id }) : undefined}
      />
    );
  };

  const renderArrow = (reaction: Reaction) => {
    const enzymeSlot = slotById.get(`${reaction.id}:enzyme`);
    const enzymeSolved = enzymeSlot ? Boolean(results[enzymeSlot.id]?.solved) : false;
    const enzyme = index.enzymes.get(reaction.enzymeId);

    const coupleViews = (['energy', 'redox'] as const).map((role) => {
      const slot = slotById.get(`${reaction.id}:${role}`);
      const solved = slot ? Boolean(results[slot.id]?.solved) : false;
      if (slot && !solved) return <Fragment key={role}>{renderSlot(slot)}</Fragment>;

      const coupleId = reaction.coupleIds.find(
        (id) => index.couples.get(id)?.role === role,
      );
      const couple = coupleId ? index.couples.get(coupleId) : undefined;
      if (!couple) return null;
      return (
        <CoupleChip
          key={role}
          couple={couple}
          solved={solved}
          onClick={onSelect ? () => onSelect({ kind: 'couple', id: couple.id }) : undefined}
        />
      );
    });

    const extras = [
      ...(reaction.consumes ?? []).map((item) => `+ ${item}`),
      ...(reaction.releases ?? []).map((item) => `− ${item}`),
    ];

    return (
      <div className={[styles.arrowBlock, reaction.reversible ? '' : styles.irreversible].join(' ')}>
        <div className={styles.line} />
        <div className={styles.enzymeRow}>
          <div className={styles.enzymeMain}>
            <span className={styles.stepTag}>{reaction.step}</span>
            {enzymeSlot && !enzymeSolved ? (
            renderSlot(enzymeSlot)
            ) : enzyme ? (
              <EnzymePill
                enzyme={enzyme}
                solved={enzymeSolved}
                selected={selection?.kind === 'enzyme' && selection.id === enzyme.id}
                onClick={onSelect ? () => onSelect({ kind: 'enzyme', id: enzyme.id }) : undefined}
              />
            ) : null}
            {reaction.reversible ? (
              <span
                className={styles.reversibleMark}
                title="Reversible under physiological conditions"
              >
                ⇌
              </span>
            ) : null}
            {coupleViews}
            {extras.map((item) => (
              <span key={item} className={styles.extra}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className={[styles.line, styles.lineTall].join(' ')} />
        <div className={styles.arrowHead} />
      </div>
    );
  };

  const renderRow = (row: (typeof model.rows)[number]) => {
    const multiplier = factorOf(row.reaction);
    const body = (
      <>
        {renderArrow(row.reaction)}
        <div className={styles.nodeRow}>
          {row.nodes.map((node) => renderNode(node, multiplier))}
        </div>
      </>
    );

    return (
      <Fragment key={row.reaction.id}>
        {row.multiplierDivider ? (
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>
              ×2 — every step below runs twice per {index.pathway.input ?? 'input molecule'}
            </span>
          </div>
        ) : null}
        {row.reaction.branch ? (
          <div className={styles.branch}>
            <span className={styles.branchCaption}>
              Side branch — this is where the second three-carbon molecule joins in
            </span>
            {body}
          </div>
        ) : (
          body
        )}
      </Fragment>
    );
  };

  return (
    <div className={styles.canvas} ref={canvasRef}>
      <div className={styles.columns} data-canvas-content="true" style={{ zoom }}>
        {groups.map((group, groupIndex) => (
          <div className={styles.column} key={group[0]?.reaction.id ?? groupIndex}>
            {groupIndex === 0 ? (
              <div className={styles.nodeRow}>{model.head.map((node) => renderNode(node, 1))}</div>
            ) : (
              <div className={styles.carryOver}>continued from column {groupIndex}</div>
            )}
            {group.map(renderRow)}
            {groupIndex < groups.length - 1 ? (
              <div className={styles.carryOver}>continues in column {groupIndex + 2} →</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--metabolite)' }} /> metabolite
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--enzyme)' }} /> enzyme
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--energy)' }} /> ATP / ADP
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--redox)' }} /> redox cofactor
        </span>
        <span className={styles.legendItem}>⚡ key regulatory step</span>
        <span className={styles.legendItem}>⇌ reversible</span>
      </div>
    </div>
  );
}
