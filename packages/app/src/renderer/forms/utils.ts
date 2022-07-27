import {useEffect} from 'react';

import {Form} from '../form';

export const useSyncFormDirtiness = (
  form: Form<any>,
  onDirtyChange: ((dirty: boolean) => void) | undefined
): void => {
  useEffect(() => {
    let lastDirty = form.state.isDirty;
    return form.watchState(() => {
      if (form.state.isDirty !== lastDirty) {
        lastDirty = form.state.isDirty;
        onDirtyChange?.(lastDirty);
      }
    });
  }, [onDirtyChange]);
};
