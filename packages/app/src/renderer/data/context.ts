import React from 'react';

import {DataContextValue} from './types';

const DataContext = React.createContext<DataContextValue>({
  execute(): never {
    throw new Error('No data context available');
  },
});

export default DataContext;
