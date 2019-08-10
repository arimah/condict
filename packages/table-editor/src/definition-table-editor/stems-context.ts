import React from 'react';
import {Map} from 'immutable';

export type StemsContextValue = {
  term: string;
  stems: Map<string, string>;
};

const StemsContextError =
  'No StemsContext provided - this is clearly a bug. Check the renderer of `DefinitionTableEditor`.';

const StemsContext = React.createContext<StemsContextValue>({
  get term(): string {
    throw new Error(StemsContextError);
  },
  get stems(): Map<string, string> {
    throw new Error(StemsContextError);
  },
});

export default StemsContext;
