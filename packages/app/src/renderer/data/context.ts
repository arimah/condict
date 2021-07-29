import React from 'react';

import {DataContextValue} from './types';

const noContext = (): never => {
  throw new Error('No data context available');
};

const DataContext = React.createContext<DataContextValue>({
  execute: noContext,
  subscribe: noContext,
  unsubscribe: noContext,
});

export default DataContext;
