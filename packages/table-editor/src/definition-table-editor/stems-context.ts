import React from 'react';

import {StemsContextValue} from './types';

const missingError = () => new Error('Stems context missing');

const StemsContext = React.createContext<StemsContextValue>({
  get term(): never {
    throw missingError();
  },
  get stems(): never {
    throw missingError();
  },
});

export default StemsContext;
