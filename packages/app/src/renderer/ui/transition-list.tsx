import {useState, useCallback, useEffect} from 'react';
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

function TransitionList<T>(props: Props<T>): JSX.Element {
  const {list, getKey, children: renderItem} = props;

  const [state, setState] = useState(() => getInitialState(list, getKey));

  const onPhaseEnd = useCallback((key: Key) => {
    setState(state => {
      const index = state.itemStates.findIndex(i => i.key === key);
      if (index === -1) {
        return state;
      }
      return produce(state, draft => {
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
    });
  }, []);

  // Compute the next state eagerly, so we don't end up out-of-sync with the
  // list by one render. This does lead to double renders.
  const nextState = state.list !== list
    ? getNextState(state, list, getKey)
    : state;

  useEffect(() => {
    if (state !== nextState) {
      setState(nextState);
    }
  }, [nextState]);

  return <>
    {nextState.itemStates.map(item =>
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
