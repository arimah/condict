import {RefObject, useRef, useEffect} from 'react';

import {QueryResult} from '../data';

import {getTabReachable} from '@condict/ui';

export type Options = {
  /**
   * The element to focus when data is available, or a function that focuses an
   * element. If errors are present, `errorFocus` will be tried first.
   */
  focus?: RefObject<HTMLElement> | FocusFn;
  /**
   * The element that will receive focus when errors are present in the data, or
   * a function that focuses an element when errors are present.
   */
  errorFocus?: RefObject<HTMLElement> | FocusFn;
  /**
   * The element that owns the content area. If focus is outside this area, then
   * the hook will not interfere with it.
   */
  ownedElem: RefObject<HTMLElement>;
  /** If true, the focused element is not scrolled into view. */
  preventScroll?: boolean;
};

export type FocusFn = () => void;

/**
 * Moves keyboard focus when a piece of content finishes loading. This hook
 * should be used in conjunction with `useData` to move focus inside a page
 * or panel, and *only* if there is no sensible initial focus. This primarily
 * happens when the panel or page starts out as a loading screen that is fully
 * replaced with data-based content. The hook can be used for sub-components
 * as well, if they contain interactive content during loading that is replaced
 * when data is available.
 * @param data The data to watch.
 * @param options Determines how to move focus.
 */
export const useRefocusOnData = (
  data: QueryResult<any>,
  options: Options
): void => {
  const lastState = useRef(data.state);

  useEffect(() => {
    if (lastState.current === 'loading' && data.state === 'data') {
      // We've gone from loading to data. Let's try to focus something.

      const {ownedElem, preventScroll} = options;
      // First we need to figure out whether we are even allowed to move the
      // focus anywhere. If the focus is inside ownedElem, then we own it and
      // can do whatever we want. If it's on document.body or null, then it's
      // currently unowned and we can claim it for ourselves (hopefully). In any
      // other situation, we should not move it. The latter could happen if a
      // panel takes a long time to load, and the user focuses e.g. the sidebar
      // while waiting, perhaps to change tabs or open something. Being pulled
      // around in that situation is unpleasant.
      const canMoveFocus =
        document.activeElement === null ||
        document.activeElement === document.body ||
        // If ownedElem.current is null, assume we cannot move.
        ownedElem.current?.contains(document.activeElement);

      if (canMoveFocus) {
        let hasFocus =
          // If there are errors and errorFocus is specified, try that first.
          data.result.errors && tryFocus(options.errorFocus, preventScroll) ||
          // Try regular focus next.
          tryFocus(options.focus, preventScroll);

        // If we didn't focus `errorFocus` or `focus`, then try to find the
        // first tab reachable thing inside ownedElem.
        if (!hasFocus && ownedElem.current) {
          const targets = getTabReachable(ownedElem.current, {
            includeRoot: false,
          });
          if (targets.length > 0) {
            (targets[0] as HTMLElement).focus({preventScroll});
            hasFocus = true;
          }
        }

        // As a last-ditch effort, focus ownedElem itself.
        if (!hasFocus) {
          tryFocus(ownedElem, preventScroll);
        }
      }
    }
    lastState.current = data.state;
  }, [data.state]);
};

const tryFocus = (
  target: RefObject<HTMLElement> | FocusFn | undefined,
  preventScroll?: boolean
): boolean => {
  if (typeof target === 'function') {
    target();
    return true;
  }

  if (target && target.current) {
    target.current.focus({preventScroll});
    return true;
  }

  return false;
};
