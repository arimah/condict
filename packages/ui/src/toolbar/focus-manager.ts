import React, {RefObject, useContext} from 'react';

import {Descendants, useDescendant} from '../descendants';

export type ItemElement = Node & {
  disabled?: boolean;
  focus(): void;
};

export type ContextValue = {
  descendants: Descendants<RefObject<ItemElement>>;
  activeChild: RefObject<ItemElement> | null;
};

export const Context = React.createContext<ContextValue | null>(null);

export const useManagedFocus = (itemRef: RefObject<ItemElement>): boolean => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Toolbar item must be placed inside a <Toolbar>');
  }
  const {descendants, activeChild} = context;
  useDescendant(descendants, itemRef);

  return activeChild === itemRef;
};
