import React from 'react';

const StemsContextError =
  'No StemsContext provided - this is clearly a bug. Check the renderer of `DefinitionTableEditor`.';

const StemsContext = React.createContext({
  get term() {
    throw new Error(StemsContextError);
  },
  get stems() {
    throw new Error(StemsContextError);
  },
});

export default StemsContext;
