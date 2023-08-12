import {useContext} from 'react';

import {Query, OperationArgs, OperationResult} from '../graphql';

import DataContext from './context';
import {useFetch} from './fetch';
import {LoadingResult, QueryResult} from './types';

/**
 * Fetches data from the underlying GraphQL layer with a specific query and
 * variable values. When the variables change, the data is refetched behind
 * the scenes. The data is *not* refetched in response to dictionary events;
 * this hook should be used for things that only need to be fetched one time,
 * with refetching when variables change.
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
 * @param mapData If provided, specifies a function that receives the result of
 *        a successful query and extracts the necessary bits from it. This
 *        function is called exactly once per fetch, and only when the query
 *        succeeds.
 *
 *        If omitted, the query data is used without modification.
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
export const useData = <Q extends Query<any, any>, T = OperationResult<Q>>(
  query: Q,
  variableValues: OperationArgs<Q>,
  mapData: (data: OperationResult<Q>) => T = mapDefault
): QueryResult<T> => {
  const {execute} = useContext(DataContext);

  const [result] = useFetch(execute, {
    query,
    variableValues,
    mapData,
    ignoreReloadErrors: false,
    initResult: LoadingResult,
    initRefs: () => ({
      prevArgs: null,
      curVersion: 0,
      nextVersion: 0,
    }),
  });

  return result;
};

const mapDefault = (data: any): any => data;
