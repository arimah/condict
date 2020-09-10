import {DependencyList, useMemo, useEffect} from 'react';

interface Debounced {
  readonly func: () => void;
  readonly cancel: () => void;
}

const debounceImpl = (timeout: number, func: () => void): Debounced => {
  let timeoutId: number | undefined = undefined;
  let lastCall = 0;
  const maybeCall = () => {
    const remaining = timeout - (Date.now() - lastCall);
    if (remaining <= 0) {
      timeoutId = undefined;
      func();
    } else {
      timeoutId = window.setTimeout(maybeCall, remaining);
    }
  };

  return {
    func: () => {
      lastCall = Date.now();
      if (timeoutId === undefined) {
        timeoutId = window.setTimeout(maybeCall, timeout);
      }
    },
    cancel: () => {
      lastCall = 0;
      window.clearTimeout(timeoutId);
    },
  };
};

/**
 * Delays execution of the specified function for an amount of time. If the
 * function is called again before that time has elapsed, the timeout is
 * reset. The function will be called exactly once after the specified
 * duration has elapsed.
 * @param timeout The timeout, in milliseconds.
 * @param func The function to call.
 * @return A debounced wrapper of {@param func}.
 */
export const debounce = (timeout: number, func: () => void): (() => void) => {
  return debounceImpl(timeout, func).func;
};

/**
 * Creates a callback that delays execution of the specified function for an
 * amount of time.
 */
export const useDebouncedCallback = (
  timeout: number,
  func: () => void,
  deps: DependencyList = []
): (() => void) => {
  const debounced = useMemo(
    () => debounceImpl(timeout, func),
    // func specifically excluded from here: otherwise we'd update on every
    // render, which would totally negate the usefulness of deps.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    [timeout, ...deps]
  );

  useEffect(() => debounced.cancel, [debounced]);

  return debounced.func;
};
