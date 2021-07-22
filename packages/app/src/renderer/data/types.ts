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
