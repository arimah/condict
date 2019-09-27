import {IFieldResolver} from 'apollo-server';

import Adaptor from '../../database/adaptor';
import {ModelResolver, MutatorResolver} from '../../model';
import {Logger} from '../../types';

import {IdOf, PageParams, Mutation} from '../types';

export type Context = {
  db: Adaptor;
  logger: Logger;
  model: ModelResolver;
  mut: MutatorResolver;
  sessionId: string | null;
  hasValidSession(): Promise<boolean>;
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

const IsMutator = Symbol('mutator function');

export type MutatorFn<A> = IFieldResolver<unknown, Context, A> & {
  [IsMutator]: true;
};

export type Mutators = {
  [K in keyof Mutation]?: MutatorFn<any>;
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
