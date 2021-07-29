import type {DictionaryEvent, DictionaryEventListener} from '@condict/server';

import {OperationResult} from '../../types';

import {
  Operation,
  Query,
  OperationArgs,
  OperationResult as OperationData,
} from '../graphql';

export type ExecuteFn = <Op extends Operation<'query' | 'mutation', any, any>>(
  operation: Op,
  variableValues: OperationArgs<Op>
) => Promise<ExecuteResult<Op>>;

/** The result of an ExecuteFn call. */
export type ExecuteResult<Op extends Operation<'query' | 'mutation', any, any>> =
  OperationResult<OperationData<Op>>;

export interface DataContextValue {
  readonly execute: ExecuteFn;
  readonly subscribe: (f: DictionaryEventListener) => void;
  readonly unsubscribe: (f: DictionaryEventListener) => void;
}

/** The result of the `useData()` hook. */
export type QueryResult<Q extends Query<any, any>> =
  | LoadingResult
  | DataResult<Q>;

/** Indicates that the data is still being fetched. */
export interface LoadingResult {
  readonly state: 'loading';
}

export const LoadingResult: LoadingResult = {state: 'loading'};

/** Contains the result of a query when fetched by the `useData()` hook.` */
export interface DataResult<Q extends Query<any, any>> {
  readonly state: 'data';
  readonly result: ExecuteResult<Q>;
}

/**
 * Determines whether to reload the data in response to a dictionary event. The
 * event encapsulates information about a change to the dictionary.
 * @param event The event to test.
 * @return True if the data should be reloaded; false to keep the current data.
 *         If the data is currently in the process of being fetched, another
 *         request will be sent.
 */
export type EventPredicate = (event: DictionaryEvent) => boolean;
