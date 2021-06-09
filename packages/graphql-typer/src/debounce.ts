// This is used by the CLI in watch mode, so we can wait for the file system
// to (probably) stabilise before emitting type definitions.

/**
 * Delays execution of the specified function for an amount of time. If the
 * function is called again before that time has elapsed, the timeout is
 * reset. The function will be called exactly once after the specified
 * duration has elapsed.
 * @param timeout The timeout, in milliseconds.
 * @param func The function to call.
 * @return A debounced wrapper of {@param func}.
 */
const debounce = (timeout: number, func: () => void): (() => void) => {
  let currentTimeout: NodeJS.Timeout | number | undefined = undefined;
  let lastCall = 0;
  const maybeCall = () => {
    const remaining = timeout - (Date.now() - lastCall);
    if (remaining <= 0) {
      currentTimeout = undefined;
      func();
    } else {
      currentTimeout = setTimeout(maybeCall, remaining);
    }
  };
  return () => {
    lastCall = Date.now();
    if (currentTimeout === undefined) {
      currentTimeout = setTimeout(maybeCall, timeout);
    }
  };
};

export default debounce;
