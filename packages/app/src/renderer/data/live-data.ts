import {Query, OperationArgs, OperationResult} from '../graphql';

import {
  QueryResult,
  ErrorResult,
  DataResult,
  EventPredicate,
} from './types';

import {DataOptions, useLiveMutData} from './live-mut-data';

export interface LiveDataHook {
  /**
   * Fetches data from the underlying GraphQL layer with a specific query and
   * variable values. When the variables change, the data is refetched behind
   * the scenes. Additionally, the data is refetched in response to events when
   * a provided function returns true.
   *
   * This hook is strict about errors: if any error at all occurs, the entire
   * data object is considered invalid and the data state may be marked as such.
   * Partial data is never returned.
   *
   * The hook assigns a monotonically incrementing version number to each request
   * and returns the result of the most recent request. If multiple requests are
   * in flight at the same time, an older result may be shown briefly, but will
   * never overwrite a newer result. The most up-to-date result always wins.
   *
   * TODO: add automatic retries
   *
   * @param query The GraphQL query that fetches the data.
   * @param variableValues Variables for the GraphQL query.
   * @param options One of the following:
   *
   *        * An object of options
   *        * A function that receives a dictionary event and determines whether
   *          the data should be refetched.
   * @return The current result of the query. The result can be in one of three
   *         states:
   *
   *         * `.state === 'loading'`: The initial request is pending. This state
   *           only occurs for the initial request and only when no initial value
   *           was passed (see `initial` in the options object).
   *         * `.state === 'data'`: The request finished with no errors and data
   *           is available in `.data`.
   *         * `.state === 'error'`: The request returned one or more errors. No
   *           data is available, but errors can be read through `.errors`.
   */
  <Q extends Query<any, any>, T = OperationResult<Q>>(
    query: Q,
    variableValues: OperationArgs<Q>,
    options: EventPredicate | DataOptions<Q, T> & {
      /**
       * If true, errors that occur while refetching data in response to events
       * are completely ignored. Setting this to true does *not* ignore errors
       * that occur during the initial query. Use this option sparingly: if an
       * error occurs, the data can easily become stale and out-of-date.
       *
       * This option is only relevant when `shouldReload` returns true. If there
       * is no `shouldReload` or it never returns true, this option has no
       * effect.
       *
       * Default: false.
       */
      ignoreReloadErrors?: boolean;
    },
  ): QueryResult<T>;

  <Q extends Query<any, any>, T = OperationResult<Q>>(
    query: Q,
    variableValues: OperationArgs<Q>,
    options: DataOptions<Q, T> & {
      /**
       * The initial value. Setting this option will prevent the hook from
       * performing its initial query, and it will only reload data in response
       * to dictionary events.
       *
       * If an initial value is given, the hook will never return a loading
       * state.
       */
      initial: T;
      /**
       * If true, errors that occur while refetching data in response to events
       * are completely ignored. Setting this to true does *not* ignore errors
       * that occur during the initial query. Use this option sparingly: if an
       * error occurs, the data can easily become stale and out-of-date.
       *
       * This option is only relevant when `shouldReload` returns true. If there
       * is no `shouldReload` or it never returns true, this option has no
       * effect.
       *
       * Default: false.
       */
      ignoreReloadErrors?: false;
    }
  ): DataResult<T> | ErrorResult;

  // If there is an initial value *and* reload errors are ignored, then we can
  // never end up with an ErrorResult.
  <Q extends Query<any, any>, T = OperationResult<Q>>(
    query: Q,
    variableValues: OperationArgs<Q>,
    options: DataOptions<Q, T> & {
      /**
       * The initial value. Setting this option will prevent the hook from
       * performing its initial query, and it will only reload data in response
       * to dictionary events.
       *
       * If an initial value is given, the hook will never return a loading
       * state.
       */
      initial: T;
      /**
       * If true, errors that occur while refetching data in response to events
       * are completely ignored. Setting this to true does *not* ignore errors
       * that occur during the initial query. Use this option sparingly: if an
       * error occurs, the data can easily become stale and out-of-date.
       *
       * This option is only relevant when `shouldReload` returns true. If there
       * is no `shouldReload` or it never returns true, this option has no
       * effect.
       *
       * Default: false.
       */
      ignoreReloadErrors: true;
    }
  ): DataResult<T>;
}

export const useLiveData = (<Q extends Query<any, any>, T>(
  query: Q,
  variableValues: OperationArgs<Q>,
  options: EventPredicate | DataOptions<Q, T> & {
    initial?: T;
    ignoreReloadErrors?: boolean;
  }
): QueryResult<T> => {
  return useLiveMutData(query, variableValues, options)[0];
}) as LiveDataHook;
