import {IFieldResolver} from '@graphql-tools/utils';

import {DataAccessor} from '../../database';
import {DictionaryEventEmitter} from '../../event';
import {Logger} from '../../types';

import {FieldArgs, Mutation} from '../types';

export interface Context {
  /** The database connection for this request. */
  readonly db: DataAccessor;
  /** The logger for the request. */
  readonly logger: Logger;
  /**
   * The session ID of the request, or null if no session ID header was sent.
   */
  readonly sessionId: string | null;
  /**
   * The request ID of the request, or null if no request ID was provided.
   */
  readonly requestId: string | null;
  /**
   * Determines whether the request has a valid user session.
   * @return True if there is a valid user session, i.e. the requester can
   *         execute mutations.
   */
  readonly hasValidSession: () => boolean;
  /** The event emitter for the request. */
  readonly events: DictionaryEventEmitter;
  /**
   * The cleanup function for this context, which absolutely *must* be called
   * when the request ends.
   */
  readonly finish: () => void;
}

export type ResolversFor<T, P> =
  RequiredResolvers<T, P> & OptionalResolvers<T, P> |
  ResolveType<P>;

// It may seem like the type conditions below are backwards: if P is null,
// then surely every resolver is *required*, not optional? In practice,
// we only use null for Query and Mutation, whose resolvers are spread out
// over multiple files.

export type RequiredResolvers<T, P> = {
  // Required are properties that are in T (the type being resolved) that do
  // *not* have a corresponding value in P. That is, T & !P, or T - P.
  [K in P extends null ? never : Exclude<keyof T, keyof P>]: IFieldResolver<
    P,
    Context,
    FieldArgs<T[K]>
  >;
};

export type OptionalResolvers<T, P> = {
  // Optional are properties that are in T (the type being resolved) that *do*
  // have a corresponding value in P. That is, T & P.
  [K in P extends null ? keyof T : keyof T & keyof P]?: IFieldResolver<
    P,
    Context,
    FieldArgs<T[K]>
  >;
};

export interface ResolveType<P> {
  // This resolver never receives arguments.
  __resolveType: IFieldResolver<P, Context, unknown>;
}

const IsMutator = Symbol('mutator function');

export type MutatorFn<A> = IFieldResolver<null, Context, A> & {
  [IsMutator]: true;
};

export type Mutators = {
  [K in keyof Mutation]?: MutatorFn<FieldArgs<Mutation[K]>>;
};
