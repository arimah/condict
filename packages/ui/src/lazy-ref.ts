import {MutableRefObject, useRef} from 'react';

const uninited = Symbol();

/**
 * Creates and returns a ref with an object that is stable across renders and
 * is initialized lazily exactly once.
 * @param init The initializer function. This is called once, on the first
 *        render, to create the initial value.
 * @return The ref.
 */
const useLazyRef = <T>(init: () => T): MutableRefObject<T> => {
  const ref = useRef<T | typeof uninited>(uninited);
  if (ref.current === uninited) {
    ref.current = init();
  }
  return ref as MutableRefObject<T>;
};

export default useLazyRef;
