import {Ref, RefObject, MutableRefObject} from 'react';

type ValidRef<T> =
  { bivarianceHack(instance: T | null): void }['bivarianceHack'] |
  RefObject<T>;

export default <T>(...refs: (Ref<T> | undefined)[]): Ref<T> => {
  const validRefs = refs.filter(Boolean) as ValidRef<T>[];

  switch (validRefs.length) {
    case 0:
      return null;
    case 1:
      return validRefs[0];
    default:
      return elem => {
        validRefs.forEach(ref => {
          if (typeof ref === 'function') {
            ref(elem);
          } else {
            (ref as MutableRefObject<T | null>).current = elem;
          }
        });
      };
  }
};
