import {UserInputError, IFieldResolver} from 'apollo-server';

import {
  Context,
  IsMutator,
  MutatorFn,
  PageParams,
  Connection,
} from './types';

/**
 * Creates a mutator resolver. The request must come from a session with a
 * user token.
 *
 * FIXME: Actually authenticate literally anything whatsoever.
 * @param resolver The resolver function to wrap.
 * @return A mutator function.
 */
export const mutator = <T, Args>(resolver: IFieldResolver<T, Context, Args>): MutatorFn<T> => {
  const fn: any =
    (p: T, args: Args, context: Context, info: any) =>
      resolver(p, args, context, info);
  fn[IsMutator] = true;
  return fn as MutatorFn<T>;
};

/**
 * Creates a public mutator resolver, i.e., a mutator that does not require
 * authentication at all. Obviously, this should be used basically only for
 * login and logout.
 * @param resolver The resolver function to wrap.
 * @return A mutator function.
 */
export const publicMutator = <T>(resolver: IFieldResolver<T, Context>): MutatorFn<T> => {
  const fn: any =
    (p: T, args: Record<string, any>, context: Context, info: any) =>
      resolver(p, args, context, info);
  fn[IsMutator] = true;
  return fn as MutatorFn<T>;
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

/**
 * Creates a connection type for use in a GraphQL response.
 * @param pageParams Pagination parameters, which describe the current page and
 *        number of items per page.
 * @param totalCount The total number of items in the collection.
 * @param nodes The items in the current window of the collection.
 */
export const createConnection = <T>(
  pageParams: PageParams,
  totalCount: number,
  nodes: T[]
): Connection<T> => ({
  meta: {
    page: pageParams.page,
    perPage: pageParams.perPage,
    totalCount,
  },
  nodes,
});
