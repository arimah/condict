/**
 * Acknowledgement: This code is heavily inspired by and referenced from the
 * excellent `tabbable` package by David Clark:
 *
 *   https://github.com/davidtheclark/tabbable
 */

export type TargetOptions = {
  /**
   * If true, the root element may be returned if it is focusable or reachable
   * by tabbing. Default: true.
   */
  includeRoot?: boolean;
  /**
   * If true, the targets are sorted by tab order before being returned. If
   * false, they are returned in DOM order. Default: true.
   */
  sorted?: boolean;
};

type PositiveTabIndexElement = {
  element: Element;
  tabIndex: number;
  originalPosition: number;
};

const candidateSelector = `
  button:enabled,
  input:enabled,
  textarea:enabled,
  select:enabled,
  a[href],
  audio[controls],
  video[controls],
  [tabindex]:not(:disabled),
  [contenteditable]:not([contenteditable=false]):not(:disabled)
`;

const getCandidates = (
  root: Element,
  includeRoot: boolean
): Element[] => {
  const candidates = Array.from(root.querySelectorAll(
    candidateSelector
  ));
  if (includeRoot && root.matches(candidateSelector)) {
    candidates.unshift(root);
  }
  return candidates;
};

const isContentEditable = (element: Element) =>
  // Don't use `isContentEditable` here. It will be true for elements that
  // are contained inside a contenteditable but are not themselves focusable.
  (element as HTMLElement).contentEditable === 'true';

const isHiddenInput = (element: Element) =>
  element.tagName === 'INPUT' &&
  (element as HTMLInputElement).type === 'hidden';

const isHidden = (element: Element) =>
  // offsetParent is null for elements that are hidden (display: none) or
  // contained in a parent that is hidden (display: none, visibility: hidden).
  // For visibility: hidden on the element itself, we need to compute the
  // current style.
  (element as HTMLElement).offsetParent === null ||
  getComputedStyle(element).visibility === 'hidden';

const isCandidateFocusable = (element: Element): boolean =>
  !(element as any).disabled &&
  !isHiddenInput(element) &&
  !isHidden(element);

const isUnreachableRadio = (element: Element): boolean => {
  if (element.tagName !== 'INPUT') {
    return false;
  }
  const radio = element as HTMLInputElement;
  if (radio.checked) {
    // If the radio button is checked, it is reachable.
    return false;
  }

  // It's possible to have multiple distinct forms with identically named
  // radio buttons, which are technically separate groups. No attempt is
  // made to detect this.
  const group = document.querySelectorAll(
    `input[type=radio][name="${radio.name}"]`
  );
  for (let i = 0; i < group.length; i++) {
    if ((group[i] as HTMLInputElement).checked) {
      // The group has a checked radio that is not this radio button;
      // the current is unreachable.
      return true;
    }
  }
  return false;
};

const getTabIndex = (element: Element): number => {
  if (isContentEditable(element)) {
    // Browsers do not consistently report the correct tabIndex for
    // contenteditable elements. We try to use the tabindex attribute,
    // or if that fails, assume 0.
    const tabIndexAttr = parseInt(element.getAttribute('tabindex') || '', 10);
    if (!isNaN(tabIndexAttr)) {
      return tabIndexAttr;
    }
    return 0;
  }
  return (element as any).tabIndex;
};

const isCandidateTabReachable = (element: Element): boolean =>
  isCandidateFocusable(element) &&
  !isUnreachableRadio(element) &&
  getTabIndex(element) >= 0;

const compareElements = (
  a: PositiveTabIndexElement,
  b: PositiveTabIndexElement
) =>
  a.tabIndex - b.tabIndex || a.originalPosition - b.originalPosition;

export const sortByTabOrder = (elements: Element[]): Element[] => {
  const defaultTabIndex: Element[] = [];
  const positiveTabIndex: PositiveTabIndexElement[] = [];

  // Elements with a positive tab index always come *before* elements with
  // a tab index of 0, and are ordered by tab index value.
  // Basically, 0 always comes last.

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const tabIndex = getTabIndex(element);
    if (tabIndex <= 0) {
      defaultTabIndex.push(element);
    } else {
      positiveTabIndex.push({
        element,
        tabIndex,
        originalPosition: i,
      });
    }
  }

  if (positiveTabIndex.length > 0) {
    positiveTabIndex.sort(compareElements);
    return positiveTabIndex
      .map(item => item.element)
      .concat(defaultTabIndex);
  }
  return defaultTabIndex;
};

export const getFocusable = (
  root: Element,
  options: TargetOptions = {}
): Element[] => {
  const {includeRoot = true, sorted = true} = options;
  const candidates = getCandidates(root, includeRoot);
  const focusable = candidates.filter(isCandidateFocusable);

  return sorted ? sortByTabOrder(focusable) : focusable;
};

export const isFocusable = (element: Element): boolean =>
  element.matches(candidateSelector) &&
  isCandidateFocusable(element);

export const getTabReachable = (
  root: Element,
  options: TargetOptions = {}
): Element[] => {
  const {includeRoot = true, sorted = true} = options;
  const candidates = getCandidates(root, includeRoot);
  const tabReachable = candidates.filter(isCandidateTabReachable);

  return sorted ? sortByTabOrder(tabReachable) : tabReachable;
};

export const isTabReachable = (element: Element): boolean =>
  element.matches(candidateSelector) &&
  isCandidateTabReachable(element);
