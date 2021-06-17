import React, {useContext} from 'react';

import {OpenDialogFn} from './types';

export const OpenDialogContext = React.createContext<OpenDialogFn>((): never => {
  throw new Error('No context available');
});

export const useOpenDialog = (): OpenDialogFn => useContext(OpenDialogContext);
