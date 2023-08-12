import {Dispatch, SetStateAction, useState, useEffect} from 'react';
import shallowEqual from 'shallowequal';

import {useLazyRef} from '@condict/ui';

import {Query, OperationArgs, OperationResult} from '../graphql';

import {ExecuteFn, ExecuteResult, QueryResult} from './types';

export interface Options<
  Q extends Query<any, any>,
  T,
  Refs extends FetchRefs<Q>
> {
  query: Q;
  variableValues: OperationArgs<Q>;
  mapData: (data: OperationResult<Q>) => T;
  ignoreReloadErrors: boolean;
  initResult: QueryResult<T> | (() => QueryResult<T>);
  initRefs: () => Refs;
  onLoadedData?: (data: T) => void;
}

export interface FetchRefs<Q extends Query<any, any>> {
  prevArgs: PrevArgs<Q> | null;
  curVersion: number;
  nextVersion: number;
}

export interface PrevArgs<Q extends Query<any, any>> {
  readonly query: Q;
  readonly variableValues: OperationArgs<Q>;
}

type SetQueryResult<T> = Dispatch<SetStateAction<QueryResult<T>>>;

export const useFetch = <
  Q extends Query<any, any>,
  T,
  Refs extends FetchRefs<Q>
>(
  execute: ExecuteFn,
  {
    query,
    variableValues,
    mapData,
    ignoreReloadErrors,
    initResult,
    initRefs,
    onLoadedData,
  }: Options<Q, T, Refs>
): [QueryResult<T>, SetQueryResult<T>, Refs] => {
  const [result, setResult] = useState<QueryResult<T>>(initResult);

  const {current: refs} = useLazyRef<Refs>(initRefs);

  if (needRefetch(refs.prevArgs, query, variableValues)) {
    refs.prevArgs = {query, variableValues};
    refs.nextVersion++;
  }

  useEffect(() => {
    if (refs.curVersion === refs.nextVersion) {
      return;
    }

    // TODO: add support for automatic retries once that becomes relevant

    const version = refs.nextVersion;
    void execute(query, variableValues).catch<ExecuteResult<Q>>(error => {
      // Remap the error to a GraphQL-like error value
      return {
        state: 'error',
        errors: [{
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          message: String(error.message || error),
        }],
      };
    }).then(r => {
      if (version > refs.curVersion) {
        const {data, errors} = r;
        if (errors && errors.length > 0) {
          const shouldShowError =
            // Always show errors that happen on the initial request. If there
            // is initial data, result will never be loading.
            result.state === 'loading' ||
            // If we've been explicitly told to ignore the error, do so.
            !ignoreReloadErrors;
          if (shouldShowError) {
            refs.curVersion = version;
            setResult({state: 'error', errors});
          } else {
            console.error('Fetch error:', errors);
          }
        } else {
          // The outer 'data' object is *never* null or undefined if there
          // are no errors. It can only be null if a non-nullable top-level
          // field fails to resolve to a value, which is an error.
          const mappedData = mapData(data as OperationResult<Q>);
          refs.curVersion = version;
          setResult({state: 'data', data: mappedData});
          onLoadedData?.(mappedData);
        }
      }
    });
  }, [refs.nextVersion]);

  return [result, setResult, refs];
};

function needRefetch<Q extends Query<any, any>>(
  prev: PrevArgs<Q> | null,
  nextQuery: Q,
  nextVariables: OperationArgs<Q>
): boolean {
  if (!prev) {
    // Fetch on the first call.
    return true;
  }

  if (prev.query !== nextQuery) {
    // We always need to refetch if the query changes.
    return true;
  }

  // Same query. Let's compare variable values.
  return !shallowEqual(prev.variableValues, nextVariables);
}
