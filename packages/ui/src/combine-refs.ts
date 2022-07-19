import {Ref, MutableRefObject} from 'react';

export default <T>(...refs: (Ref<T> | undefined)[]): Ref<T> => {
  const validRefs = refs.filter(Boolean) as NonNullable<Ref<T>>[];

  switch (validRefs.length) {
    case 0:
      return null;
    case 1:
      return validRefs[0];
    default:
      return elem => {
        for (const ref of validRefs) {
          if (typeof ref === 'function') {
            ref(elem);
          } else {
            (ref as MutableRefObject<T | null>).current = elem;
          }
        }
      };
  }
};
