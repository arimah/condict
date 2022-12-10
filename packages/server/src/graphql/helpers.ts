import {IFieldResolver} from '@graphql-tools/utils';

import {AuthenticationError, UserInputError} from '../errors';

import {PageParams} from './types';
import {Context, MutatorFn} from './resolvers';

/**
 * Creates a mutator resolver. The request must have a valid session ID.
 * @param resolver The resolver function to wrap.
 * @return A mutator function.
 */
export const mutator = <Args>(
  resolver: IFieldResolver<unknown, Context, Args>
): MutatorFn<Args> => {
  const fn: IFieldResolver<unknown, Context, Args> =
    (p, args, context, info) => {
      if (!context.hasValidSession()) {
        throw new AuthenticationError('Session ID is missing, expired or invalid');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return resolver(p, args, context, info);
    };
  return fn as MutatorFn<Args>;
};

/**
 * Creates a public mutator resolver, i.e., a mutator that does not require
 * authentication at all. Obviously, this should be used basically only for
 * login and logout.
 * @param resolver The resolver function to wrap.
 * @return A mutator function.
 */
export const publicMutator = <Args>(
  resolver: IFieldResolver<unknown, Context, Args>
): MutatorFn<Args> => resolver as MutatorFn<Args>;

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
