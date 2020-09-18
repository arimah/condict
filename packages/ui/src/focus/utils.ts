import {isFocusableElement} from './types';
import {isFocusable} from './targets';

export const tryFocus = (...elements: (Element | null)[]): void => {
  for (const element of elements) {
    if (
      element &&
      isFocusable(element) &&
      isFocusableElement(element)
    ) {
      if (document.activeElement !== element) {
        element.focus();
        if (element.tagName === 'INPUT') {
          (element as HTMLInputElement).select();
        }
      }
      return;
    }
  }
};

export const getNearestFocusable = (
  element: Element | null
): Element | null => {
  if (
    !element ||
    element === document.body ||
    element === document.documentElement
  ) {
    return null;
  }
  if (isFocusable(element)) {
    return element;
  }
  if (element.tagName === 'LABEL') {
    const {control} = element as HTMLLabelElement;
    // The associated control may be disabled.
    if (control && isFocusable(control)) {
      return control;
    }
  }
  return getNearestFocusable(element.parentNode as Element | null);
};
