import {
  RefObject,
  MouseEvent as SyntheticMouseEvent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import produce from 'immer';

import {MovingState} from './types';
import * as S from './styles';

export interface ReorderState {
  listRef: RefObject<HTMLUListElement>;
  moving: CurrentMovingState | undefined;
  onMove: (from: number, to: number) => void;
  onMoveDone: () => void;
  onDragStart: (e: SyntheticMouseEvent, index: number) => void;
}

export interface CurrentMovingState {
  readonly phase: 'moving' | 'dragging' | 'done';
  readonly from: number;
  readonly to: number;
  readonly primary: MovingState;
  readonly other: MovingState;
}

export const CurrentMovingState = {
  get(state: CurrentMovingState, index: number): MovingState | undefined {
    if (index === state.from) {
      return state.primary;
    }
    const inRange = state.from < state.to
      ? state.from <= index && index <= state.to
      : state.to <= index && index <= state.from;
    if (inRange) {
      return state.other;
    }
    if (state.phase === 'dragging') {
      return UnmovedDraggingState;
    }
    return;
  },
} as const;

const UnmovedDraggingState: MovingState = {
  offset: 0,
  animate: true,
  primary: false,
};

interface ItemPos {
  readonly top: number;
  readonly bottom: number;
  readonly height: number;
}

const useTableReordering = (
  move: (from: number, to: number) => void
): ReorderState => {
  const listRef = useRef<HTMLUListElement>(null);

  const [moving, setMoving] = useState<CurrentMovingState | undefined>();

  const onMove = useCallback((from: number, to: number) => {
    if (moving || !listRef.current) {
      // Wait until we're done.
      return;
    }

    const list = listRef.current;
    const fromItem = list.children[from];
    const fromRect = fromItem.getBoundingClientRect();
    const toItem = list.children[to];
    const toRect = toItem.getBoundingClientRect();

    const [primary, other] = getMoveOffsets(from, fromRect, to, toRect);
    setMoving({
      phase: 'moving',
      from,
      to,
      primary: {offset: primary, primary: true, animate: true},
      other: {offset: other, primary: false, animate: true},
    });
  }, [moving]);

  const onDragStart = useCallback((e: SyntheticMouseEvent, index: number) => {
    if (moving || !listRef.current) {
      // Wait until we're done.
      return;
    }

    const list = listRef.current;
    const listRect = list.getBoundingClientRect();

    // Coordinates are relative to the *list element*, in case the user scrolls
    // while dragging. Each item's *target offset* is relative to the *item*.
    const items: ItemPos[] = Array.from(list.children, item => {
      const rect = item.getBoundingClientRect();
      return {
        top: rect.y - listRect.y,
        bottom: rect.bottom - listRect.y,
        height: rect.height,
      };
    });

    setMoving({
      phase: 'dragging',
      from: index,
      to: index,
      primary: {offset: 0, primary: true, animate: false},
      other: {offset: 0, primary: false, animate: true},
    });

    let mouseDY = 0;
    const drag = (e: MouseEvent) => {
      mouseDY += e.movementY;

      const listRect = list.getBoundingClientRect();
      const offsetY = getDragOffset(items, index, listRect, mouseDY);
      const targetIndex = getDragTargetIndex(items, index, offsetY);
      const [_, otherOffset] = getMoveOffsets(
        index,
        items[index],
        targetIndex,
        items[targetIndex]
      );

      setMoving(produce(draft => {
        if (!draft) {
          return;
        }
        draft.to = targetIndex;
        draft.primary.offset = offsetY;
        draft.other.offset = otherOffset;
      }));
    };

    const dragEnd = () => {
      setMoving(moving => {
        if (!moving) {
          return;
        }
        // We can rely on `moving` to contain an accurate target index as well
        // as the correct `other` offset. We just need to figure out where the
        // dragged item should end up.
        const {to: targetIndex, primary: {offset: currentOffset}} = moving;
        const [targetOffset] = getMoveOffsets(
          index,
          items[index],
          targetIndex,
          items[targetIndex]
        );
        return produce(moving, draft => {
          if (currentOffset !== targetOffset) {
            draft.phase = 'moving';
            draft.primary.offset = targetOffset;
            draft.primary.animate = true;
          } else {
            draft.phase = 'done';
            draft.other.animate = false;
          }
        });
      });
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
    };

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  }, [moving]);

  const onMoveDone = useCallback(() => {
    setMoving(produce(prev => {
      if (!prev || prev.phase !== 'moving') {
        return;
      }
      prev.phase = 'done';
      prev.primary.animate = false;
      prev.other.animate = false;
    }));
  }, []);

  useEffect(() => {
    if (moving && moving.phase === 'done') {
      const {from, to} = moving;
      void Promise.resolve().then(() => {
        setMoving(undefined);
        move(from, to);
      });
    }
  }, [moving]);

  return {listRef, moving, onMove, onMoveDone, onDragStart};
};

export default useTableReordering;

const getMoveOffsets = (
  from: number,
  fromRect: ItemPos,
  to: number,
  toRect: ItemPos
): [number, number] => {
  let primaryOffset: number;
  let otherOffset: number;

  if (from < to) {
    // Moving down: fromRect.bottom moves to toRect.bottom.
    primaryOffset = toRect.bottom - fromRect.bottom;
    otherOffset = -(fromRect.height + S.TableItemGap);
  } else {
    // Moving up: fromRect.top moves to toRect.top.
    primaryOffset = toRect.top - fromRect.top;
    otherOffset = fromRect.height + S.TableItemGap;
  }

  return [primaryOffset, otherOffset];
};

const getDragOffset = (
  items: ItemPos[],
  dragIndex: number,
  listRect: DOMRectReadOnly,
  mouseDY: number
): number => {
  const dragged = items[dragIndex];
  return clamp(
    mouseDY,
    -dragged.top,
    listRect.height - dragged.height - dragged.top
  );
};

const getDragTargetIndex = (
  items: ItemPos[],
  dragIndex: number,
  offsetY: number
): number => {
  const pos = items[dragIndex];
  const midY = pos.top + pos.height / 2 + offsetY;

  let result = dragIndex;
  if (offsetY < 0) {
    // Dragging up - look at earlier items.
    for (let i = dragIndex - 1; i >= 0; i--) {
      const otherPos = items[i];
      if (midY < otherPos.bottom) {
        result = i;
      }
    }
  } else {
    // Dragging down - look at later items.
    for (let i = dragIndex + 1; i < items.length; i++) {
      if (midY > items[i].top) {
        result = i;
      }
    }
  }
  return result;
};

const clamp = (value: number, min: number, max: number) =>
  value < min ? min :
  value > max ? max :
  value;
