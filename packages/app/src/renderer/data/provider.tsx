import {ReactNode, useMemo, useRef, useEffect} from 'react';

import type {DictionaryEventListener} from '@condict/server';

import {OperationResult as ExecuteResult} from '../../types';

import {Operation, OperationArgs, OperationResult} from '../graphql';
import ipc from '../ipc';

import DataContext from './context';
import {DataContextValue} from './types';

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
