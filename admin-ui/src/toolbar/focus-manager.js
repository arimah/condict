import React, {useContext, useEffect} from 'react';

export const Context = React.createContext(null);

export const useManagedFocus = itemRef => {
  const {descendants, currentFocus} = useContext(Context);

  descendants.register(itemRef);
  useEffect(() => () => descendants.unregister(itemRef), []);

  return currentFocus === itemRef;
};
