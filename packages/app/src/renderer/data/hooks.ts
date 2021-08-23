import {useState, useRef, useContext, useEffect} from 'react';
import shallowEqual from 'shallowequal';

import type {DictionaryEventListener} from '@condict/server';

import {Query, OperationArgs} from '../graphql';

import DataContext from './context';
import {QueryResult, LoadingResult, ExecuteFn, EventPredicate} from './types';

interface PrevArgs<Q extends Query<any, any>> {
  readonly query: Q;
  readonly variableValues: OperationArgs<Q>;
}

export function useData<Q extends Query<any, any>>(
  query: Q,
  variableValues: OperationArgs<Q>,
  reloadOn?: EventPredicate
): QueryResult<Q> {
  const {execute, subscribe, unsubscribe} = useContext(DataContext);

  const [result, setResult] = useState<QueryResult<Q>>(LoadingResult);

  // Arguments from previous run, or null on the first run.
  const prevArgs = useRef<PrevArgs<Q> | null>(null);

  // Reference to the current reload predicate.
  const reloadOnRef = useRef<EventPredicate | undefined>(reloadOn);
  reloadOnRef.current = reloadOn;

  // A simple toggle that we can update to force a re-render.
  const [_reloadState, setReloadState] = useState(false);

  // Request ID counter that we can use to:
  //
  //   1. force the fetch effect to re-run;
  //   2. keep track of the current request, so that old responses can be
  //      discarded correctly.
  const requestId = useRef(0);

  if (needRefetch(prevArgs.current, query, variableValues)) {
    prevArgs.current = {
      query,
      variableValues,
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

  useEffect(() => {
    if (reloadOn) {
      const handleEvent: DictionaryEventListener = ({events}) => {
        // We never register an event subscription unless there's a reload
        // predicate, but an event may still be received between runs of this
        // effect, where reloadOnRef.current is undefined. We should never
        // reload in that case.
        const reloadOn = reloadOnRef.current;
        if (!reloadOn) {
          return;
        }

        for (let i = 0; i < events.length; i++) {
          if (reloadOn(events[i])) {
            setReloadState(s => {
              requestId.current++;
              return !s;
            });
            break;
          }
        }
      };
      subscribe(handleEvent);
      return () => {
        unsubscribe(handleEvent);
      };
    }
    return;
  }, [reloadOn !== undefined]);

  return result;
}

function needRefetch<Q extends Query<any, any>>(
  prev: PrevArgs<Q> | null,
  nextQuery: Q,
  nextVariables: OperationArgs<Q>
): boolean {
  if (!prev) {
    // Always fetch on the first call.
    return true;
  }

  if (prev.query !== nextQuery) {
    // We always need to refetch if the query changes.
    return true;
  }

  // Same query, no dependencies. Let's compare variable values.
  return !shallowEqual(prev.variableValues, nextVariables);
}

export const useExecute = (): ExecuteFn => useContext(DataContext).execute;

export const useDictionaryEvents = (
  subscriber: DictionaryEventListener
): void => {
  const {subscribe, unsubscribe} = useContext(DataContext);

  const subscriberRef = useRef(subscriber);
  subscriberRef.current = subscriber;

  useEffect(() => {
    const listener: DictionaryEventListener = batch => {
      subscriberRef.current(batch);
    };
    subscribe(listener);
    return () => {
      unsubscribe(listener);
    };
  }, []);
};
