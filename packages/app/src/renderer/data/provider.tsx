import {ReactNode, useMemo} from 'react';

import {OperationResult as ExecuteResult} from '../../types';

import {Operation, OperationArgs, OperationResult} from '../graphql-shared';
import ipc from '../ipc';

import DataContext from './context';
import {DataContextValue} from './types';

export type Props = {
  children: ReactNode;
};

const DataProvider = (props: Props): JSX.Element => {
  const {children} = props;

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
  }), []);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
