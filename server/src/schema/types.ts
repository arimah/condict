import {IResolverObject, IFieldResolver} from 'apollo-server';
import {Logger} from 'winston';

import Adaptor from '../database/adaptor';
import {ModelResolver, MutatorResolver} from '../model';

export interface Context {
  db: Adaptor;
  logger: Logger;
  model: ModelResolver;
  mut: MutatorResolver;
}

export type Resolvers<T> = IResolverObject<T, Context>;

export const IsMutator = Symbol('mutator function');

export interface MutatorFn<T> extends IFieldResolver<T, Context> {
  readonly [IsMutator]: boolean;
}

export interface Mutators<T> {
  [k: string]: MutatorFn<T>;
}

/**
 * A resolver arguments type for a resolver that accept a single, required ID,
 * with the name `id`.
 */
export interface IdArg {
  id: string;
}

/**
 * A resolver arguments type for a resolver that accepts a single, optional
 * PageParams object with the name `page`.
 */
export interface PageArg {
  page?: PageParams | null;
}

// NOTE: The below types must be synchronised with the GraphQL schema.

export interface PageParams {
  page: number;
  perPage: number;
}

export interface ConnectionMeta {
  page: number;
  perPage: number;
  totalCount: number;
}

export interface Connection<T> {
  meta: ConnectionMeta;
  nodes: T[];
}
