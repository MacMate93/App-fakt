/*
 * Drag and drop, built on pointer events.
 *
 * One code path covers mouse, pen and touch, which is what makes the trainer
 * usable on an iPad without a second implementation. Dragging is never the only
 * way to answer: tapping a token selects it and tapping a slot drops it there,
 * and because both are real buttons the same flow works from the keyboard.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { Token } from '@/types/session';

const DRAG_THRESHOLD_PX = 6;

interface DragContextValue {
  dragging: Token | null;
  pointer: { x: number; y: number } | null;
  overSlotId: string | null;
  selectedTokenId: string | null;
  selectToken: (tokenId: string | null) => void;
  startDrag: (token: Token, event: ReactPointerEvent) => void;
  registerSlot: (slotId: string, element: HTMLElement | null) => void;
  dropSelected: (slotId: string) => void;
}

const DragCtx = createContext<DragContextValue | null>(null);

export function DragProvider({
  onDrop,
  children,
}: {
  onDrop: (slotId: string, tokenId: string) => void;
  children: ReactNode;
}) {
  const slots = useRef(new Map<string, HTMLElement>());
  const origin = useRef<{ x: number; y: number } | null>(null);
  const candidate = useRef<Token | null>(null);

  const [dragging, setDragging] = useState<Token | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [overSlotId, setOverSlotId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const registerSlot = useCallback((slotId: string, element: HTMLElement | null) => {
    if (element) slots.current.set(slotId, element);
    else slots.current.delete(slotId);
  }, []);

  const hitTest = useCallback((x: number, y: number): string | null => {
    for (const [slotId, element] of slots.current) {
      const rect = element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return slotId;
    }
    return null;
  }, []);

  const startDrag = useCallback((token: Token, event: ReactPointerEvent) => {
    candidate.current = token;
    origin.current = { x: event.clientX, y: event.clientY };
  }, []);

  const selectToken = useCallback((tokenId: string | null) => {
    setSelectedTokenId((current) => (current === tokenId ? null : tokenId));
  }, []);

  const dropSelected = useCallback(
    (slotId: string) => {
      setSelectedTokenId((current) => {
        if (current) onDrop(slotId, current);
        return null;
      });
    },
    [onDrop],
  );

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const token = candidate.current;
      const start = origin.current;
      if (!token || !start) return;
      const far =
        Math.abs(event.clientX - start.x) > DRAG_THRESHOLD_PX ||
        Math.abs(event.clientY - start.y) > DRAG_THRESHOLD_PX;
      if (!far && !dragging) return;
      event.preventDefault();
      setDragging(token);
      setPointer({ x: event.clientX, y: event.clientY });
      setOverSlotId(hitTest(event.clientX, event.clientY));
    };

    const finish = (event: PointerEvent) => {
      const token = candidate.current;
      candidate.current = null;
      origin.current = null;
      if (!token) return;
      const wasDragging = dragging;
      setDragging(null);
      setPointer(null);
      setOverSlotId(null);
      if (!wasDragging) {
        // A tap, not a drag: fall back to select-then-place.
        setSelectedTokenId((current) => (current === token.id ? null : token.id));
        return;
      }
      const target = hitTest(event.clientX, event.clientY);
      if (target) {
        onDrop(target, token.id);
        setSelectedTokenId(null);
      }
    };

    const cancel = () => {
      candidate.current = null;
      origin.current = null;
      setDragging(null);
      setPointer(null);
      setOverSlotId(null);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [dragging, hitTest, onDrop]);

  const value = useMemo(
    () => ({
      dragging,
      pointer,
      overSlotId,
      selectedTokenId,
      selectToken,
      startDrag,
      registerSlot,
      dropSelected,
    }),
    [dragging, pointer, overSlotId, selectedTokenId, selectToken, startDrag, registerSlot, dropSelected],
  );

  return <DragCtx.Provider value={value}>{children}</DragCtx.Provider>;
}

export function useDrag(): DragContextValue {
  const value = useContext(DragCtx);
  if (!value) throw new Error('useDrag must be used inside a DragProvider.');
  return value;
}
