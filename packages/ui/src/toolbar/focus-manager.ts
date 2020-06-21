import React, {RefObject, useContext, useEffect} from 'react';

import DescendantCollection from '../descendant-collection';

export type ItemElement = Node & {
  disabled?: boolean;
  focus(): void;
};

export type Descendants = DescendantCollection<RefObject<ItemElement>, ItemElement>;

export type ContextValue = {
  descendants: Descendants;
  currentFocus: RefObject<ItemElement> | null;
};

export const Context = React.createContext<ContextValue | null>(null);

export const useManagedFocus = (itemRef: RefObject<ItemElement>): boolean => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Toolbar item must be placed inside a <Toolbar>');
  }
  const {descendants, currentFocus} = context;

  descendants.register(itemRef);
  useEffect(() => () => descendants.unregister(itemRef), []);

  return currentFocus === itemRef;
};
