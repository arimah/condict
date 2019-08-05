const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

export type Descendant = Node & {
  disabled?: boolean;
};

export type GetElementFunc<R, E extends Descendant> = (element: R) => E;

export default class DescendantCollection<R, E extends Descendant> {
  private getElem: GetElementFunc<R, E>;
  private itemRefList: R[];
  private itemRefSet: Set<R>;
  private sorted: boolean;

  public constructor(getElem: GetElementFunc<R, E>) {
    this.getElem = getElem;

    this.itemRefList = [];
    this.itemRefSet = new Set(); // For fast lookup
    this.sorted = true; // The empty list is sorted.
  }

  public register(itemRef: R) {
    if (this.itemRefSet.has(itemRef)) {
      return;
    }

    this.itemRefSet.add(itemRef);
    this.itemRefList.push(itemRef);
    this.sorted = false;
  }

  public unregister(itemRef: R) {
    if (this.itemRefSet.has(itemRef)) {
      this.itemRefSet.delete(itemRef);
      const index = this.itemRefList.indexOf(itemRef);
      this.itemRefList.splice(index, 1);
    }
  }

  public getFirst(): R | null {
    this.ensureSorted();
    return this.itemRefList[0] || null;
  }

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

  public getLast(): R | null {
    this.ensureSorted();
    return this.itemRefList[this.itemRefList.length - 1] || null;
  }

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

  public filter(pred: (ref: R) => boolean): R[] {
    this.ensureSorted();
    return this.itemRefList.filter(pred);
  }

  public find(pred: (ref: R) => boolean): R | undefined {
    return this.itemRefList.find(pred);
  }

  public findManagedRef(elem: E): R | undefined {
    const {getElem, itemRefList: items} = this;
    return items.find(ref => getElem(ref) === elem);
  }

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
