import {OperationResult} from '../../types';

import {IdOf} from '../graphql';

const NonWhiteSpace = /\S/;

export const notEmpty = (value: string): 'empty' | null =>
  !NonWhiteSpace.test(value) ? 'empty' : null;

export function nameNotTaken<I extends IdOf<any>, D>(
  editingId: I | null,
  execute: (name: string) => Promise<OperationResult<D>>,
  getId: (data: D) => I | null
): (name: string) => Promise<'taken' | null> {
  return async name => {
    const res = await execute(name.trim());
    if (!res.data || res.errors) {
      // Let validation pass until we try to submit the form.
      if (res.errors) {
        console.error('Check name: GraphQL error:', res.errors);
      }
      return null;
    }
    const existingId = getId(res.data);
    if (existingId === null || existingId === editingId) {
      return null;
    }
    return 'taken';
  };
}
