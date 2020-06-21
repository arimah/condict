const enum Placement {
  BELOW_LEFT = 'BELOW_LEFT',
  BELOW_RIGHT = 'BELOW_RIGHT',
  ABOVE_LEFT = 'ABOVE_LEFT',
  ABOVE_RIGHT = 'ABOVE_RIGHT',
  LEFT_TOP = 'LEFT_TOP',
  LEFT_BOTTOM = 'LEFT_BOTTOM',
  RIGHT_TOP = 'RIGHT_TOP',
  RIGHT_BOTTOM = 'RIGHT_BOTTOM',
}

export default Placement;

export type Point = {
  x: number;
  y: number;
};

export type RelativeParent = Element | DOMRect | ClientRect | Point;

type ParentRect = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

const isElement = (parent: RelativeParent): parent is Element =>
  (parent as any).nodeType != undefined;

const isDomRect = (parent: RelativeParent): parent is DOMRect | ClientRect =>
  (parent as any).left != undefined && (parent as any).width != undefined;

const getParentRect = (parent: RelativeParent): ParentRect => {
  if (isElement(parent)) {
    const elemRect = parent.getBoundingClientRect();
    return elemRect;
  }
  if (isDomRect(parent)) {
    return parent;
  }
  return {
    left: parent.x,
    right: parent.x,
    top: parent.y,
    bottom: parent.y,
    width: 0,
    height: 0,
  };
};

const getViewport = () => ({
  top: window.scrollY,
  left: window.scrollX,
  // documentElement.client{Width,Height} does NOT include the scrollbar.
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
});

const clamp = (value: number, min: number, max: number) =>
  value < min ? min :
  value > max ? max :
  value;

// The Placement enum combines two properties in single value.
//
// The first component is the attachment; that is, which edge of the relative
// parent our element is glued to. For ABOVE and BELOW, the words describe
// where the element will end up relative to its parent. I thought this was a
// fairly intuitive way of naming it. In total, we have four attachments
// (using `<-->` to mean "is attached to"):
//
//   - BELOW: parent bottom <--> element top.
//   - ABOVE: parent top <--> element bottom.
//   - LEFT: parent left <--> element right.
//   - RIGHT: parent right <--> element left.
//
// The second component is the alignment. The attachment tells us what to do
// with one dimension; the alignment affects the other dimension. The value is
// the name of the edges that are aligned: LEFT means the parent's left edge
// is aligned with the element's left edge, and so on.
//
// If the viewport is too small for the selected *attachment*, the element
// will happily jump around to the opposite side. If you say the element
// should be below, but there isn't enough space, it will end up above instead.
// Alignment and attachment are additionally clamped to fit the viewport. If
// the viewport is smaller than the element, the element will stop at the top
// left corner of the viewport. It is not possible in that case to scroll to
// reveal more of the element; this may change in the future.

export const placeElement = (
  elem: HTMLElement | SVGElement,
  parent: RelativeParent,
  placement: Placement
): void => {
  const elemRect = elem.getBoundingClientRect();
  const parentRect = getParentRect(parent);
  const viewport = getViewport();

  // Vertical position first.
  let top = NaN;
  switch (placement) {
    // Attachment
    case Placement.BELOW_LEFT:
    case Placement.BELOW_RIGHT:
      top = parentRect.bottom + elemRect.height <= viewport.height
        ? parentRect.bottom
        : parentRect.top - elemRect.height;
      break;
    case Placement.ABOVE_LEFT:
    case Placement.ABOVE_RIGHT:
      top = parentRect.top - elemRect.height >= 0
        ? parentRect.top - elemRect.height
        : parentRect.bottom;
      break;
    // Alignment
    case Placement.LEFT_TOP:
    case Placement.RIGHT_TOP:
      top = parentRect.top;
      break;
    case Placement.LEFT_BOTTOM:
    case Placement.RIGHT_BOTTOM:
      top = parentRect.bottom - elemRect.height;
      break;
  }
  top = clamp(Math.floor(top), 0, viewport.height - elemRect.height);

  // Horizontal position second.
  let left = NaN;
  switch (placement) {
    // Alignment
    case Placement.BELOW_LEFT:
    case Placement.ABOVE_LEFT:
      left = parentRect.left;
      break;
    case Placement.BELOW_RIGHT:
    case Placement.ABOVE_RIGHT:
      left = parentRect.right - elemRect.width;
      break;
    // Attachment
    case Placement.LEFT_TOP:
    case Placement.LEFT_BOTTOM:
      left = parentRect.left - elemRect.width >= 0
        ? parentRect.left - elemRect.width
        : parentRect.right;
      break;
    case Placement.RIGHT_TOP:
    case Placement.RIGHT_BOTTOM:
      left = parentRect.right + elemRect.width <= viewport.width
        ? parentRect.right
        : parentRect.left - elemRect.width;
      break;
  }
  left = clamp(Math.floor(left), 0, viewport.width - elemRect.width);

  elem.style.top = `${top + viewport.top}px`;
  elem.style.left = `${left + viewport.left}px`;
};

