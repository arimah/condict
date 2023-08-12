import {
  Dispatch,
  SetStateAction,
  useState,
  useContext,
  useEffect,
} from 'react';

import type {DictionaryEventListener} from '@condict/server';

import {Query, OperationArgs, OperationResult} from '../graphql';

import DataContext from './context';
import {FetchRefs, useFetch} from './fetch';
import {
  QueryResult,
  LoadingResult,
  ErrorResult,
  DataResult,
  EventPredicate,
} from './types';

export interface LiveMutDataHook {
  /**
   * Fetches data from the underlying GraphQL layer with a specific query and
   * variable values. When the variables change, the data is refetched behind
   * the scenes. Additionally, the data is refetched in response to events when
   * a provided function returns true. This hook returns a two-element array
   * with the result and a function for updating it, allowing the state to be
   * changed immediately in response to user actions.
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
   * @return A two-element array containing, in order, the current result of the
   *         query and a function to update it. The result can be in one of three
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
  ): MutDataResult<QueryResult<T>>;

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
  ): MutDataResult<DataResult<T> | ErrorResult>;

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
  ): MutDataResult<DataResult<T>>;
}

export interface DataOptions<Q extends Query<any, any>, T> {
  /**
   * Determines whether the data should be refetched in response to a dictionary
   * event. The predicate examines exactly one event at a time and returns
   * either true (data should be reloaded) or false (keep the old result).
   */
  shouldReload: EventPredicate;
  /**
   * If provided, specifies a function that receives the result of a successful
   * query and extracts the necessary bits from it. This function is called
   * exactly once per fetch, and only when the query succeeds.
   *
   * If omitted, the query data is used without modification.
   * @param data The result of the query.
   * @return The extracted data.
   */
  mapData?: (data: OperationResult<Q>) => T;
  /**
   * If provided, receives all data loaded by this hook, for performing updates
   * elsewhere in response to the arrival of new data, without the need for
   * effects that potentially leave the UI out-of-sync for one render pass.
   * @param data The data, after passing through `mapData`.
   */
  onLoadedData?: (data: T) => void;
}

type MutDataResult<T> = [T, Dispatch<SetStateAction<T>>];

interface LiveRefs<Q extends Query<any, any>> extends FetchRefs<Q> {
  shouldReload: EventPredicate;
}

export const useLiveMutData = (<Q extends Query<any, any>, T>(
  query: Q,
  variableValues: OperationArgs<Q>,
  options: EventPredicate | DataOptions<Q, T> & {
    initial?: T;
    ignoreReloadErrors?: boolean;
  }
): MutDataResult<QueryResult<T>> => {
  const {execute, subscribe, unsubscribe} = useContext(DataContext);

  const {
    mapData = mapDefault as (data: OperationResult<Q>) => T,
    initial = undefined,
    shouldReload,
    ignoreReloadErrors = false,
    onLoadedData = undefined,
  } = typeof options === 'function' ? {shouldReload: options} : options;

  // A counter that we can increment to force a re-render.
  const [, wake] = useState(0);

  const [result, setResult, refs] = useFetch<Q, T, LiveRefs<Q>>(execute, {
    query,
    variableValues,
    mapData,
    ignoreReloadErrors,
    initResult: () =>
      initial !== undefined
        ? {state: 'data', data: initial}
        : LoadingResult,
    initRefs: () => ({
      // Arguments from previous run, or null on the first run.
      // If there's an initial value, we set this to the initial arguments to
      // skip the first fetch.
      prevArgs: initial !== undefined
        ? {query, variableValues}
        : null,
      shouldReload,
      curVersion: 0,
      nextVersion: 0,
    }),
    onLoadedData,
  });

  refs.shouldReload = shouldReload;

  useEffect(() => {
    const handleEvent: DictionaryEventListener = ({events}) => {
      for (let i = 0; i < events.length; i++) {
        if (refs.shouldReload(events[i])) {
          refs.nextVersion++;
          wake(inc);
          break;
        }
      }
    };
    subscribe(handleEvent);
    return () => {
      unsubscribe(handleEvent);
    };
  }, []);

  return [result, setResult];
}) as LiveMutDataHook;

const mapDefault = (data: any): any => data;

const inc = (n: number): number => n + 1;
