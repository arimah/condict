import {
  DependencyList,
  useState,
  useRef,
  useContext,
  useEffect,
} from 'react';
import shallowEqual from 'shallowequal';

import {Query, OperationArgs} from '../graphql-shared';

import DataContext from './context';
import {QueryResult, LoadingResult, ExecuteFn} from './types';

interface PrevArgs<Q extends Query<any, any>> {
  readonly query: Q,
  readonly variableValues: OperationArgs<Q>,
  readonly deps: DependencyList | undefined,
}

export function useData<Q extends Query<any, any>>(
  query: Q,
  variableValues: OperationArgs<Q>,
  deps?: DependencyList
): QueryResult<Q> {
  const {execute} = useContext(DataContext);

  const [result, setResult] = useState<QueryResult<Q>>(LoadingResult);

  // Arguments from previous run, or null on the first run.
  const prevArgs = useRef<PrevArgs<Q> | null>(null);

  // Request ID counter that we can use to:
  //
  //   1. force the fetch effect to re-run;
  //   2. keep track of the current request, so that old responses can be
  //      discarded correctly.
  const requestId = useRef(0);

  if (needRefetch(prevArgs.current, query, variableValues, deps)) {
    prevArgs.current = {
      query,
      variableValues,
      deps,
    };
    requestId.current++;
  }

  useEffect(() => {
    const id = requestId.current;
    execute(query, variableValues).then(
      result => {
        if (id === requestId.current) {
          setResult({state: 'data', result});
        }
      },
      error => {
        if (id === requestId.current) {
          // Only update to an error state if this is still the current request.
          setResult({
            state: 'data',
            result: {
              errors: [{
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                message: String(error.message || error),
              }],
            },
          });
        } else {
          console.error('Error fetching data:', error);
        }
      }
    );
  }, [requestId.current, execute]);

  return result;
}

function needRefetch<Q extends Query<any, any>>(
  prev: PrevArgs<Q> | null,
  nextQuery: Q,
  nextVariables: OperationArgs<Q>,
  nextDeps: DependencyList | undefined
): boolean {
  if (!prev) {
    // Always fetch on the first call.
    return true;
  }

  if (prev.query !== nextQuery) {
    // We always need to refetch if the query changes.
    return true;
  }

  if (nextDeps) {
    // If dependencies are specified, they take precedence over variable values.
    const prevDeps = prev.deps;
    return (
      // No dependencies previously = need refetch.
      !prevDeps ||
      // Length changed = need refetch.
      nextDeps.length !== prevDeps.length ||
      // Value differs = need refetch.
      nextDeps.some((x, i) => x !== prevDeps[i])
    );
  }

  // Same query, no dependencies. Let's compare variable values.
  return !shallowEqual(prev.variableValues, nextVariables);
}

export const useExecute = (): ExecuteFn => useContext(DataContext).execute;
