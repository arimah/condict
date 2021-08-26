import {useEffect} from 'react';

/**
 * Represents a generic collection of descendants. This type is used primarily
 * for focus management: it keeps track of all descendants (not just direct
 * children) that register themselves with it, and allows those descendants to
 * be traversed in the order specified by the `compare` function.
 *
 * This can be used, for example, to implement left/right arrow key navigation
 * through a toolbar or menu.
 *
 * The values stored in the collection need not be DOM elements; the collection
 * permits any values that can be ordered.
 */
export interface Descendants<D> {
  /** The items of the collection, which are sorted if `sorted` is true. */
  readonly items: D[];
  /** The items of the collection, in an unspecified order. */
  readonly itemSet: Set<D>;
  /**
   * Compares the relative order of two items in the collection, used when
   * the collection needs to be sorted.
   * @param a The first item to compare.
   * @param b The second item to compare.
   * @return Less than zero if a < b; greater than zero if a > b; and zero
   *         if a === b.
   */
  readonly compare: (a: D, b: D) => number;
  /**
   * True if the collection's items are currently sorted, according to the
   * `compare` function. This field is updated by `Descendants.ensureSorted`,
   * and should not be touched by other code.
   */
  sorted: boolean;
}

export const Descendants = {
  /**
   * Creates a new, empty descendant collection.
   * @param compare The compare function that will be used to sort items in the
   *        collection on demand.
   */
  create<D>(compare: (a: D, b: D) => number): Descendants<D> {
    return {
      items: [],
      itemSet: new Set<D>(),
      compare,
      sorted: true, // The empty list is sorted
    };
  },

  /**
   * Registers an item with a descendant collection. If the item is already in
   * the collection, this is a no-op.
   * @param desc The collection to add the item to.
   * @param item The item to add.
   */
  register<D>(desc: Descendants<D>, item: D): void {
    if (desc.itemSet.has(item)) {
      return;
    }

    desc.items.push(item);
    desc.itemSet.add(item);
    desc.sorted = false;
  },

  /**
   * Removes an item from the descendant collection. If the item is not in
   * the collection, this is a no-op.
   * @param desc The collection to remove the item from.
   * @param item The item to remove.
   */
  unregister<D>(desc: Descendants<D>, item: D): void {
    // Note: Removing an item doesn't change the relative order. If the
    // collection was ordered before, it will be ordered afterwards too.
    if (desc.itemSet.delete(item)) {
      const index = desc.items.indexOf(item);
      desc.items.splice(index, 1);
    }
  },

  /**
   * Gets the first item in the collection that matches a specified predicate.
   * @param desc The collection to search.
   * @param filter An optional predicate to filter items by. If the predicate
   *        returns false for an item, it is excluded from the search.
   * @return The first matching item in the collection, or null if there was no
   *         match.
   */
  first<D>(desc: Descendants<D>, filter: Predicate<D> = allowAll): D | null {
    const {items} = desc;
    if (items.length === 0) {
      return null;
    }

    Descendants.ensureSorted(desc);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (filter(item)) {
        return item;
      }
    }
    return null;
  },

  /**
   * Gets the last item in the collection that matches a specified predicate.
   * @param desc The collection to search.
   * @param filter An optional predicate to filter items by. If the predicate
   *        returns false for an item, it is excluded from the search.
   * @return The last matching item in the collection, or null if there was no
   *         match.
   */
  last<D>(desc: Descendants<D>, filter: Predicate<D> = allowAll): D | null {
    const {items} = desc;
    if (items.length === 0) {
      return null;
    }

    Descendants.ensureSorted(desc);
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (filter(item)) {
        return item;
      }
    }
    return null;
  },

  /**
   * Finds the next item in the collection that matches a specified predicate.
   * @param desc The descendant collection to search.
   * @param current The current item.
   * @param filter An optional predicate to filter items by. If the predicate
   *        returns false for an item, it is excluded from the search.
   * @return The next item, or null if there is no next item.
   */
  next<D>(
    desc: Descendants<D>,
    current: D,
    filter: Predicate<D> = allowAll
  ): D | null {
    Descendants.ensureSorted(desc);

    const {items} = desc;
    let index = items.indexOf(current) + 1;
    while (index < items.length) {
      const item = items[index];
      if (filter(item)) {
        return item;
      }

      index++;
    }

    // Nothing found
    return null;
  },

  /**
   * Finds the next item in the collection that matches a specified predicate,
   * wrapping around the end if necessary.
   * @param desc The descendant collection to search.
   * @param current The current item.
   * @param filter An optional predicate to filter items by. If the predicate
   *        returns false for an item, it is excluded from the search.
   * @return The next item, or the current item if none matched. Note that the
   *         returned value may come before the current item, if the search
   *         wrapped around.
   */
  nextWrapping<D>(
    desc: Descendants<D>,
    current: D,
    filter: Predicate<D> = allowAll
  ): D {
    Descendants.ensureSorted(desc);

    const {items} = desc;
    const currentIndex = items.indexOf(current);
    let index = (currentIndex + 1) % items.length;

    while (index !== currentIndex) {
      const item = items[index];
      if (filter(item)) {
        return item;
      }

      index = (index + 1) % items.length;
    }

    return current;
  },

  /**
   * Finds the previous item in the collection that matches a specified
   * predicate.
   * @param desc The descendant collection to search.
   * @param current The current item.
   * @param filter An optional predicate to filter items by. If the predicate
   *        returns false for an item, it is excluded from the search.
   * @return The previous item, or null if there is no previous item.
   */
  prev<D>(
    desc: Descendants<D>,
    current: D,
    filter: Predicate<D> = allowAll
  ): D | null {
    Descendants.ensureSorted(desc);

    const {items} = desc;
    let index = items.indexOf(current) - 1;
    while (index >= 0) {
      const item = items[index];
      if (filter(item)) {
        return item;
      }

      index--;
    }

    return null;
  },

  /**
   * Finds the previous item in the collection that matches a specified
   * predicate, wrapping around the start if necessary.
   * @param desc The descendant collection to search.
   * @param current The current item.
   * @param filter An optional predicate to filter items by. If the predicate
   *        returns false for an item, it is excluded from the search.
   * @return The previous item, or the current item if none matched. Note that
   *         the returned value may come after the current item, if the search
   *         wrapped around.
   */
  prevWrapping<D>(
    desc: Descendants<D>,
    current: D,
    filter: Predicate<D> = allowAll
  ): D {
    Descendants.ensureSorted(desc);

    const {items} = desc;
    const currentIndex = items.indexOf(current);
    let index = (currentIndex + items.length - 1) % items.length;

    while (index !== currentIndex) {
      const item = items[index];
      if (filter(item)) {
        return item;
      }

      index = (index + items.length - 1) % items.length;
    }

    return current;
  },

  /**
   * Returns all items that match a specified predicate. The items are returned
   * in the order specified by the collection's `compare` function.
   * @param desc The descendant collection to filter.
   * @param pred The predicate to filter items by.
   * @return All matching items, in the collection's preferred order.
   */
  filter<D>(desc: Descendants<D>, pred: Predicate<D>): D[] {
    Descendants.ensureSorted(desc);
    return desc.items.filter(pred);
  },

  /**
   * Ensures that the descendant collection's `items` array is sorted. If the
   * collection's `sorted` flag is true, this is a no-op.
   * @param desc The collection to sort.
   */
  ensureSorted<D>(desc: Descendants<D>): void {
    if (!desc.sorted) {
      desc.items.sort(desc.compare);
      desc.sorted = true;
    }
  },
};

export type Predicate<D> = (item: D) => boolean;

const allowAll: Predicate<unknown> = () => true;

const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

/**
 * Implements a function that compares the document position of two nodes.
 * @param a The first node.
 * @param b The second node.
 * @return -1 if a comes before b in document order; 1 if a comes after b; or
 *         0 if a and b are the same node.
 */
export const compareNodes = (a: Node, b: Node): number => {
  const relativePos = b.compareDocumentPosition(a);
  if ((relativePos & DOCUMENT_POSITION_PRECEDING) !== 0) {
    // a comes before b
    return -1;
  }
  if ((relativePos & DOCUMENT_POSITION_FOLLOWING) !== 0) {
    // a comes after b
    return 1;
  }
  return 0;
};

/**
 * Implements an effect hook that registers a value as a descendant on mount,
 * and unregisters itself when unmounted or when `self` changes.
 * @param collection The collection to register a descendant in.
 * @param self The descendant to register.
 */
export const useDescendant = <D>(collection: Descendants<D>, self: D): void => {
  useEffect(() => {
    Descendants.register(collection, self);
    return () => {
      Descendants.unregister(collection, self);
    };
  }, [collection, self]);
};
