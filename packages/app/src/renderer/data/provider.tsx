import {ReactNode, useContext, useMemo, useRef, useEffect} from 'react';

import type {DictionaryEventListener} from '@condict/server';

import {OperationResult as ExecuteResult} from '../../types';

import {Operation, OperationArgs, OperationResult} from '../graphql';
import ipc from '../ipc';

import DataContext from './context';
import {DataContextValue, ExecuteFn} from './types';

export type Props = {
  children: ReactNode;
};

const DataProvider = (props: Props): JSX.Element => {
  const {children} = props;

  const subscribers = useRef(new Set<DictionaryEventListener>());

  const value = useMemo<DataContextValue>(() => ({
    execute<Op extends Operation<'query' | 'mutation', any, any>>(
      operation: Op,
      variableValues: OperationArgs<Op>
    ): Promise<ExecuteResult<OperationResult<Op>>> {
      // TODO: Validate the result somehow?
      return ipc.invoke('execute-operation', {
        operation,
        variableValues,
      }) as Promise<ExecuteResult<OperationResult<Op>>>;
    },
    subscribe(f) {
      subscribers.current.add(f);
    },
    unsubscribe(f) {
      subscribers.current.delete(f);
    },
  }), []);

  useEffect(() => {
    ipc.on('dictionary-event-batch', (_e, batch) => {
      console.log(
        `Sending event batch to ${subscribers.current.size} subscribers:`,
        batch
      );
      subscribers.current.forEach(f => f(batch));
    });
  }, []);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;

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
