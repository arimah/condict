import {RefObject, useRef, useEffect} from 'react';

import {Query, OperationResult} from '../graphql';
import {QueryResult, DataResult} from '../data';

import {getTabReachable} from '@condict/ui';

export type Options<D> = {
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
   * The element that will receive focus when the data is empty (according to
   * `isEmpty`), or a function that focuses an element under that condition. If
   * errors are present, `errorFocus` will be tried first.
   */
  emptyFocus?: RefObject<HTMLElement> | FocusFn;
  /**
   * The element that owns the content area. If focus is outside this area, then
   * the hook will not interfere with it.
   */
  ownedElem: RefObject<HTMLElement>;
  /**
   * Determines whether the data is empty. When the data goes from non-empty to
   * empty, that typically signifies a deletion, in which case focus generally
   * needs to be repaired. If specified, focus will be repaired when the data
   * state goes from non-empty data to empty-data, or vice versa.
   */
  isEmpty?: (data: D) => boolean;
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
export const useRefocusOnData = <Q extends Query<any, any>>(
  data: QueryResult<Q>,
  options: Options<OperationResult<Q>>
): void => {
  const lastState = useRef(data.state);
  const lastEmpty = useRef(false);

  const isEmpty =
    data.state === 'data' &&
    data.result.data != null &&
    (options.isEmpty?.(data.result.data) ?? false);

  useEffect(() => {
    const needRefocus =
      data.state === 'data' && (
        // If we were previously loading and now have data, always refocus.
        lastState.current == 'loading' ||
        // If we have data, refocus if the emptiness of the data has changed.
        // If the data object itself is null or undefined, we view it as empty
        // (usually the result of an error).
        lastEmpty.current !== isEmpty
      );
    lastState.current = data.state;
    lastEmpty.current = isEmpty;

    if (needRefocus) {
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
          // We cannot get here unless data.state === 'data'.
          (data as DataResult<Q>).result.errors &&
            tryFocus(options.errorFocus, preventScroll) ||
          // Empty data? Try `emptyFocus`.
          isEmpty && tryFocus(options.emptyFocus, preventScroll) ||
          // Try regular focus next.
          tryFocus(options.focus, preventScroll);

        // If we didn't focus anything above, then try to find the first tab
        // reachable thing inside ownedElem.
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
  }, [data.state, isEmpty]);
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
