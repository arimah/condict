import {useState, useCallback, useEffect, useRef} from 'react';
import produce from 'immer';

export type Props<T> = {
  list: readonly NonPrimitive<T>[];
  getKey: ItemKeyFn<T>;
  children: ItemRenderFn<T>;
};

type NonPrimitive<T> =
  T extends boolean | number | string | null | undefined
    ? never
    : T;

export type ItemKeyFn<T> = (item: T) => Key;

export type ItemRenderFn<T> = (
  item: T,
  phase: ItemPhase,
  onPhaseEnd: () => void
) => JSX.Element;

export type ItemPhase = 'entering' | 'idle' | 'leaving';

type Key = string | number;

interface ListState<T> {
  readonly list: readonly T[];
  readonly itemStates: readonly ItemState<T>[];
  readonly keyToItem: ReadonlyMap<Key, T>;
}

interface ItemState<T> {
  readonly key: Key;
  readonly item: T;
  readonly phase: ItemPhase;
}

function TransitionList<T>(props: Props<T>): JSX.Element | null {
  const {list, getKey, children: renderItem} = props;

  // This component is a bit hacky. When the input list changes, we want new
  // items to be added and old items to start leaving in the same render. To
  // accomplish this, we compute the next state during render. But we also
  // need some way to tell React to re-render when items finish transitioning.
  //
  // Hence, the current up-to-date canonical state is kept in a ref (stateRef),
  // and then when onPhaseEnd is called, we derive the next state from stateRef
  // and toggle setRender to force the component to update.

  const [_render, setRender] = useState(false);
  const stateRef = useRef<ListState<T> | null>(null);
  if (stateRef.current === null) {
    stateRef.current = getInitialState(list, getKey);
  }

  const onPhaseEnd = useCallback((key: Key) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = stateRef.current!;

    const index = state.itemStates.findIndex(i => i.key === key);
    if (index === -1) {
      return;
    }

    const nextState = produce(state, draft => {
      const itemState = draft.itemStates[index];
      switch (itemState.phase) {
        case 'entering':
          // Once the item has entered, it is idle.
          itemState.phase = 'idle';
          break;
        case 'idle':
          // Nothing to do.
          break;
        case 'leaving':
          // Once the item has left, we can safely delete it.
          draft.itemStates.splice(index, 1);
          draft.keyToItem.delete(itemState.key);
          break;
      }
    });

    stateRef.current = nextState;
    setRender(r => !r);
  }, []);

  // Compute the next state eagerly, so we don't end up out-of-sync with the
  // list by one render.
  const state = stateRef.current.list !== list
    ? getNextState(stateRef.current, list, getKey)
    : stateRef.current;
  stateRef.current = state;

  return <>
    {state.itemStates.map(item =>
      <Item
        key={item.key}
        state={item}
        render={renderItem}
        onPhaseEnd={onPhaseEnd}
      />
    )}
  </>;
}

export default TransitionList;

function getInitialState<T>(
  list: readonly T[],
  getKey: ItemKeyFn<T>
): ListState<T> {
  const keyToItem = new Map<Key, T>();
  const itemStates = list.map<ItemState<T>>(item => {
    const key = getKey(item);
    keyToItem.set(key, item);
    return {key, item, phase: 'entering'};
  });
  return {list, itemStates, keyToItem};
}

function getNextState<T>(
  prev: ListState<T>,
  list: readonly T[],
  getKey: ItemKeyFn<T>
): ListState<T> {
  // TODO: Honour input array's order?

  const keyToItem = new Map<Key, T>();

  // New items are those that were not seen in the previous state.
  const newItemStates: ItemState<T>[] = [];
  for (const item of list) {
    const key = getKey(item);
    if (!prev.keyToItem.has(key)) {
      newItemStates.push({key, item, phase: 'entering'});
    }
    keyToItem.set(key, item);
  }

  const itemStates = prev.itemStates.map<ItemState<T>>(item => {
    // If the item is not already leaving and it's not present in the new
    // list, then we have to start the transition away. This may abort an
    // item that is currently entering.
    const stillAlive = keyToItem.has(item.key);
    if (!stillAlive) {
      keyToItem.set(item.key, item.item);

      if (item.phase !== 'leaving') {
        return {...item, phase: 'leaving'};
      }
    } else {
      // The key is the same as an item in the input array, but the actual
      // value may have changed (e.g. some properties may have been updated),
      // in which case we must update the item to include the new value.

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newValue = keyToItem.get(item.key)!;
      if (newValue !== item.item) {
        return {...item, item: newValue};
      }
    }

    // Nothing to change.
    return item;
  });

  return {
    list,
    itemStates: itemStates.concat(newItemStates),
    keyToItem,
  };
}

type ItemProps<T> = {
  state: ItemState<T>;
  render: ItemRenderFn<T>;
  onPhaseEnd: (key: Key) => void;
};

function Item<T>(props: ItemProps<T>): JSX.Element {
  const {state, render, onPhaseEnd} = props;
  return render(
    state.item,
    state.phase,
    () => onPhaseEnd(state.key)
  );
}

/**
 * A helper hook that can be used for items with no transitions at all.
 * @param phase The current phase
 * @param onPhaseEnd The function that is called when the current phase ends.
 */
export const useImmediateEntryAndExit = (
  phase: ItemPhase,
  onPhaseEnd: () => void
): void => {
  useEffect(() => {
    if (phase !== 'idle') {
      // HACK: We have to do this in a short timeout for some reason, or React
      // doesn't remove the DOM node correctly when leaving.
      // Possibly a bug in React.
      const timeoutId = window.setTimeout(() => {
        onPhaseEnd();
      }, 2);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [phase, onPhaseEnd]);
};
