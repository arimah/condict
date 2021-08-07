import {OperationResult} from '../../types';

import {IdOf} from '../graphql';

const NonWhiteSpace = /\S/;

export const notEmpty = (value: string): boolean => NonWhiteSpace.test(value);

export function nameNotTaken<I extends IdOf<any>, D>(
  editingId: I | null,
  execute: (name: string) => Promise<OperationResult<D>>,
  getId: (data: D) => I | null
): (name: string) => Promise<boolean> {
  return async name => {
    const res = await execute(name.trim());
    if (!res.data || res.errors) {
      // Let validation pass until we try to submit the form.
      if (res.errors) {
        console.error('Check name: GraphQL error:', res.errors);
      }
      return true;
    }
    const existingId = getId(res.data);
    return existingId === null || existingId === editingId;
  };
}
