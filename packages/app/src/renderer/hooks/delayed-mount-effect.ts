import {useEffect, useRef} from 'react';

/**
 * Executes an callback some time after mounting the component. This is
 * effectively the same as a setTimeout inside a useEffect, except that this
 * hook always calls the most recently given callback (if the component is
 * rendered multiple times before the effect is triggered).
 *
 * If the component is unmounted before the callback has been called, then the
 * timeout is aborted and the callback will never be called.
 */
export const useDelayedMountEffect = (
  timeout: number,
  fn: () => void
): void => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const id = window.setTimeout(() => {
      fnRef.current();
    }, timeout);

    return () => {
      window.clearTimeout(id);
    };
  }, []);
};
