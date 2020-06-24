import React, {useContext} from 'react';

import {EditorContextValue, Messages} from './types';

const missingError = () => new Error('Editor context missing');

const EditorContext = React.createContext<EditorContextValue<any, any>>({
  get CellData(): never {
    throw missingError();
  },
  get CellEditor(): never {
    throw missingError();
  },
  get ContextMenu(): never {
    throw missingError();
  },
  get canEditCell(): never {
    throw missingError();
  },
  get multiSelect(): never {
    throw missingError();
  },
  get describeCell(): never {
    throw missingError();
  },
  get hasContextMenu(): never {
    throw missingError();
  },
});

export default EditorContext;

export const useEditor = <D, M extends Messages>(): EditorContextValue<D, M> =>
  useContext(EditorContext) as EditorContextValue<D, M>;
