import {UserInputError, IFieldResolver} from 'apollo-server';

import {PageParams} from './types';
import {Context, IsMutator, MutatorFn} from './resolvers/types';

/**
 * Creates a mutator resolver. The request must come from a session with a
 * user token.
 *
 * FIXME: Actually authenticate literally anything whatsoever.
 * @param resolver The resolver function to wrap.
 * @return A mutator function.
 */
export const mutator = <T, Args>(
  resolver: IFieldResolver<T, Context, Args>
): MutatorFn => {
  const fn: any =
    (p: T, args: Args, context: Context, info: any) =>
      resolver(p, args, context, info);
  fn[IsMutator] = true;
  return fn as MutatorFn;
};

/**
 * Creates a public mutator resolver, i.e., a mutator that does not require
 * authentication at all. Obviously, this should be used basically only for
 * login and logout.
 * @param resolver The resolver function to wrap.
 * @return A mutator function.
 */
export const publicMutator = <T, Args>(
  resolver: IFieldResolver<T, Context, Args>
): MutatorFn => {
  const fn: any =
    (p: T, args: Args, context: Context, info: any) =>
      resolver(p, args, context, info);
  fn[IsMutator] = true;
  return fn as MutatorFn;
};

export const validatePageParams = (
  page: PageParams,
  maxPerPage: number
): PageParams => {
  if (page.page < 0) {
    throw new UserInputError(`Page number cannot be negative; got ${page.page}`, {
      invalidArgs: ['page'],
    });
  }

  if (page.perPage < 1 || page.perPage > maxPerPage) {
    throw new UserInputError(`perPage must be between 1 and ${maxPerPage}; got ${page.perPage}`, {
      invalidArgs: ['page'],
    });
  }

  return page;
};
