const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

export type Descendant = Node & {
  disabled?: boolean;
};

/**
 * Represents a function which, given a value of type R, produces an element
 * of type E that can be used by DescendantCollection.
 */
export type GetElementFunc<R, E extends Descendant> = (element: R) => E;

/**
 * Represents a generic collection of descendant elements. This class is used
 * primarily for focus management: it keeps track of all descendant elements
 * (not just direct children) that register themselves with it, and allows
 * those descendants to be traversed in DOM order. Left/right arrow keys can
 * then be used to move to the next/previous element, for instance.
 *
 * The actual values stored in the descendant collection need not be actual
 * DOM elements. The type parameter `R` is the type of the collection's values,
 * while `E` describes the DOM element type extracted from values of type `R`.
 *
 * Example:
 *
 *   type Ref = RefObject<HTMLElement>;
 *   const getElement = (ref: Ref) => {
 *     if (!ref.current) {
 *       throw new Error('No element!');
 *     }
 *     ref.current;
 *   };
 *   //...
 *   const descendants = new DescendantCollection(getElement);
 *
 *   // In each descendant:
 *   const ownRef = useRef(...);
 *   descendants.register(ownRef); // obtain through some context
 *
 *   // In response to a left arrow key down event:
 *   const prev = descendants.getPrevious(current);
 *   prev.focus();
 */
export default class DescendantCollection<R, E extends Descendant> {
  private getElem: GetElementFunc<R, E>;
  // Item refs are stored twice, since JS has no built-in OrderedSet and we
  // definitely need to be able to reorder items according to DOM order.
  private itemRefList: R[];
  private itemRefSet: Set<R>;
  private sorted: boolean;

  /**
   * @param getElem A function which, given a value of type R, extracts its
   *        current element. Note that null and undefined are *not* valid
   *        return values; an actual DOM node must be returned.
   */
  public constructor(getElem: GetElementFunc<R, E>) {
    this.getElem = getElem;

    this.itemRefList = [];
    this.itemRefSet = new Set(); // For fast lookup
    this.sorted = true; // The empty list is sorted.
  }

  /**
   * Registers a descendant with this collection. If the descendant is already
   * in the collection, nothing happens.
   *
   * This method should be called during rendering, not in an effect.
   * @param itemRef The descendant to register.
   */
  public register(itemRef: R) {
    if (this.itemRefSet.has(itemRef)) {
      return;
    }

    this.itemRefSet.add(itemRef);
    this.itemRefList.push(itemRef);
    this.sorted = false;
  }

  /**
   * Removes a descendant from this collection. If the descendant is not in
   * the collection, nothing happens.
   *
   * This method should be called when the descendant unmounts.
   */
  public unregister(itemRef: R) {
    // Note: Removing an element doesn't change the relative order. If the
    // collection was ordered before, it will be ordered afterwards too.
    if (this.itemRefSet.has(itemRef)) {
      this.itemRefSet.delete(itemRef);
      const index = this.itemRefList.indexOf(itemRef);
      this.itemRefList.splice(index, 1);
    }
  }

  /**
   * Gets the first (in DOM order) descendant in the collection. If the
   * collection is empty, returns null.
   */
  public getFirst(): R | null {
    this.ensureSorted();
    return this.itemRefList[0] || null;
  }

  /**
   * Gets the first (in DOM order) enabled descendant in the collection. If
   * the collection contains no enabled elements, returns null.
   */
  public getFirstEnabled(): R | null {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    for (let i = 0; i < items.length; i++) {
      if (!getElem(items[i]).disabled) {
        return items[i];
      }
    }
    return null;
  }

  /**
   * Gets the last (in DOM order) descendant in the collection. If the
   * collection is empty, returns null.
   */
  public getLast(): R | null {
    this.ensureSorted();
    return this.itemRefList[this.itemRefList.length - 1] || null;
  }

  /**
   * Gets the last (in DOM order) enabled descendant in the collection. If
   * the collection contains no enabled elements, returns null.
   */
  public getLastEnabled(): R | null {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    for (let i = items.length - 1; i >= 0; i--) {
      if (!getElem(items[i]).disabled) {
        return items[i];
      }
    }
    return null;
  }

  /**
   * Gets the next (in DOM order) enabled descendant in the collection,
   * relative to the specified current descendant. This function wraps around
   * the end; it may return an element that comes before the current element
   * in DOM order. If there is no next enabled element, returns the current
   * element.
   * @param currentRef The current element. Behaviour is undefined if this
   *        value is not present in the collection.
   */
  public getNext(currentRef: R): R {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    const {length} = items;

    const currentIndex = items.indexOf(currentRef);
    let nextIndex = (currentIndex + 1) % length;
    while (
      nextIndex !== currentIndex &&
      getElem(items[nextIndex]).disabled
    ) {
      nextIndex = (nextIndex + 1) % length;
    }
    return items[nextIndex];
  }

  /**
   * Gets the previous (in DOM order) enabled descendant in the collection,
   * relative to the specified current descendant. This function wraps around
   * the start; it may return an element that comes after the current element
   * in DOM order. If there is no previous enabled element, returns the current
   * element.
   * @param currentRef The current element. Behaviour is undefined if this
   *        value is not present in the collection.
   */
  public getPrevious(currentRef: R): R {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    const {length} = items;

    const currentIndex = items.indexOf(currentRef);
    let prevIndex = (length + currentIndex - 1) % length;
    while (
      prevIndex !== currentIndex &&
      getElem(items[prevIndex]).disabled
    ) {
      prevIndex = (length + prevIndex - 1) % length;
    }
    return items[prevIndex];
  }

  /**
   * Searches the specified parent node for the next enabled descendant in
   * this collection. This function wraps around the end; it may return an
   * element that comes before the current element in DOM order. If there is
   * no next enabled element inside the parent, returns null.
   * @param parentElem The element to search within. Note that if the parent
   *        is a registered descendant, it may be returned.
   * @param currentRef The current element. Behaviour is udnefined if this
   *        value is not present in the collection.
   */
  public getNextInParent(parentElem: Node, currentRef: R): R | null {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    const {length} = items;

    const currentIndex = items.indexOf(currentRef);
    let nextIndex = (currentIndex + 1) % length;
    while (
      nextIndex !== currentIndex &&
      (
        !parentElem.contains(getElem(items[nextIndex])) ||
        getElem(items[nextIndex]).disabled
      )
    ) {
      nextIndex = (nextIndex + 1) % length;
    }
    if (parentElem.contains(getElem(items[nextIndex]))) {
      return items[nextIndex];
    }
    return null;
  }

  /**
   * Searches the specified parent node for the previous enabled descendant
   * in this collection. This function wraps around the start; it may return
   * an element that comes after the current element in DOM order. If there is
   * no next enabled element inside the parent, returns null.
   * @param parentElem The element to search within. Note that if the parent
   *        is a registered descendant, it may be returned.
   * @param currentRef The current element. Behaviour is udnefined if this
   *        value is not present in the collection.
   */
  public getPreviousInParent(parentElem: Node, currentRef: R): R | null {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    const {length} = items;

    const currentIndex = items.indexOf(currentRef);
    let prevIndex = (length + currentIndex - 1) % length;
    while (
      prevIndex !== currentIndex &&
      (
        !parentElem.contains(getElem(items[prevIndex])) ||
        getElem(items[prevIndex]).disabled
      )
    ) {
      prevIndex = (length + prevIndex - 1) % length;
    }
    if (parentElem.contains(getElem(items[prevIndex]))) {
      return items[prevIndex];
    }
    return null;
  }

  /**
   * Returns those items that match the specified predicate.
   * @param pred The predicate to test each item against.
   */
  public filter(pred: (ref: R) => boolean): R[] {
    this.ensureSorted();
    return this.itemRefList.filter(pred);
  }

  /**
   * Finds the item that matches the specified predicate, or returns undefined
   * if there is no match.
   * @param pred The predicate to test each item against.
   */
  public find(pred: (ref: R) => boolean): R | undefined {
    return this.itemRefList.find(pred);
  }

  /**
   * Finds the item that owns the specified element, or return undefined if
   * no item matches.
   * @param elem The element whose owner to locate.
   */
  public findManagedRef(elem: E): R | undefined {
    const {getElem, itemRefList: items} = this;
    return items.find(ref => getElem(ref) === elem);
  }

  /**
   * Ensures that the item list is sorted (in DOM order).
   */
  private ensureSorted() {
    if (!this.sorted) {
      const {getElem, itemRefList: items} = this;
      items.sort((a, b) => {
        const aElem = getElem(a);
        const bElem = getElem(b);
        const relativePos = bElem.compareDocumentPosition(aElem);
        if ((relativePos & DOCUMENT_POSITION_PRECEDING) !== 0) {
          // a comes before b
          return -1;
        }
        if ((relativePos & DOCUMENT_POSITION_FOLLOWING) !== 0) {
          // a comes after b
          return 1;
        }
        return 0;
      });
      this.sorted = true;
    }
  }
}
