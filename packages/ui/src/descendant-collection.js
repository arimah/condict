const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

export default class DescendantCollection {
  constructor(getElem) {
    this.getElem = getElem;

    this.itemRefList = [];
    this.itemRefSet = new Set(); // For fast lookup
    this.sorted = true; // The empty list is sorted.
  }

  register(itemRef) {
    if (this.itemRefSet.has(itemRef)) {
      return;
    }

    this.itemRefSet.add(itemRef);
    this.itemRefList.push(itemRef);
    this.sorted = false;
  }

  unregister(itemRef) {
    if (this.itemRefSet.has(itemRef)) {
      this.itemRefSet.delete(itemRef);
      const index = this.itemRefList.indexOf(itemRef);
      this.itemRefList.splice(index, 1);
    }
  }

  getFirst() {
    this.ensureSorted();
    return this.itemRefList[0] || null;
  }

  getFirstEnabled() {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    for (let i = 0; i < items.length; i++) {
      if (!getElem(items[i]).disabled) {
        return items[i];
      }
    }
    return null;
  }

  getLast() {
    this.ensureSorted();
    return this.itemRefList[this.itemRefList.length - 1] || null;
  }

  getLastEnabled() {
    this.ensureSorted();
    const {getElem, itemRefList: items} = this;
    for (let i = items.length - 1; i >= 0; i--) {
      if (!getElem(items[i]).disabled) {
        return items[i];
      }
    }
    return null;
  }

  getNext(currentRef) {
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

  getPrevious(currentRef) {
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

  getNextInParent(parentElem, currentRef) {
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

  getPreviousInParent(parentElem, currentRef) {
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

  filter(pred) {
    this.ensureSorted();
    return this.itemRefList.filter(pred);
  }

  findManagedRef(elem) {
    const {getElem, itemRefList: items} = this;
    return items.find(ref => getElem(ref) === elem);
  }

  ensureSorted() {
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
