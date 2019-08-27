import {IFieldResolver} from 'apollo-server';
import {Logger} from 'winston';

import Adaptor from '../../database/adaptor';
import {ModelResolver, MutatorResolver} from '../../model';

import {IdOf, PageParams, PageInfo, Mutation} from '../types';

export type Context = {
  db: Adaptor;
  logger: Logger;
  model: ModelResolver;
  mut: MutatorResolver;
};

export type ResolversFor<T, P> = {
  // The default arguments type, `Record<string, any>`, does not deal well with
  // required arguments: TypeScript complains about them being required by the
  // actual arguments type, but absent in `Record<string, any>`. As much as I
  // don't want `any` here, it seems to be the only practical solution.
  [K in keyof T]?: IFieldResolver<P, Context, any>;
} & {
  // This resolver never receives arguments.
  __resolveType?: IFieldResolver<P, Context, {}>;
};

export const IsMutator = Symbol('mutator function');

export type MutatorFn = IFieldResolver<unknown, Context> & {
  readonly [IsMutator]: boolean;
};

export type Mutators = {
  [K in keyof Mutation]?: MutatorFn;
};

/**
 * A resolver arguments type for a resolver that accept a single, required ID,
 * with the name `id`.
 */
export type IdArg<T extends IdOf<any>> = {
  id: T;
};

/**
 * A resolver arguments type for a resolver that accepts a single, optional
 * PageParams object with the name `page`.
 */
export type PageArg = {
  page?: PageParams | null;
};

// NOTE: The below type is a generic version of various connection types from
// the GraphQL schema. It must be synchronised with the GraphQL schema.

export type Connection<T> = {
  page: Pick<PageInfo, 'page' | 'perPage' | 'totalCount'>;
  nodes: T[];
};
