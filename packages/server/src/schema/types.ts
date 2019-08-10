import {IResolverObject, IFieldResolver} from 'apollo-server';
import {Logger} from 'winston';

import Adaptor from '../database/adaptor';
import {ModelResolver, MutatorResolver} from '../model';
import {InputIdOf} from '../model/id-of';

export type Context = {
  db: Adaptor;
  logger: Logger;
  model: ModelResolver;
  mut: MutatorResolver;
};

export type Resolvers<T> = IResolverObject<T, Context>;

export const IsMutator = Symbol('mutator function');

export type MutatorFn<T> = IFieldResolver<T, Context> & {
  readonly [IsMutator]: boolean;
};

export type Mutators<T> = {
  [k: string]: MutatorFn<T>;
};

/**
 * A resolver arguments type for a resolver that accept a single, required ID,
 * with the name `id`.
 */
export type IdArg<T extends InputIdOf<any>> = {
  id: T;
};

/**
 * A resolver arguments type for a resolver that accepts a single, optional
 * PageParams object with the name `page`.
 */
export type PageArg = {
  page?: PageParams | null;
};

// NOTE: The below types must be synchronised with the GraphQL schema.

export type PageParams = {
  page: number;
  perPage: number;
};

export type ConnectionMeta = {
  page: number;
  perPage: number;
  totalCount: number;
};

export type Connection<T> = {
  meta: ConnectionMeta;
  nodes: T[];
};
