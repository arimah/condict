import React, {useState, useContext, useEffect} from 'react';

export const StackContext = React.createContext(null);

export const MenuContext = React.createContext(null);

class MenuItem {
  constructor(ref, submenuRef) {
    this.ref = ref;
    this.submenuRef = submenuRef;
  }

  get id() {
    return this.ref.current.id;
  }

  get self() {
    return this.ref.current;
  }

  get submenu() {
    return this.submenuRef && this.submenuRef.current;
  }
}

export const useNearestMenu = (ref, submenuRef, label, disabled, onActivate) => {
  const context = useContext(MenuContext);

  const [item] = useState(() => new MenuItem(ref, submenuRef));
  item.label = label;
  item.disabled = disabled;
  item.onActivate = onActivate;

  context.items.register(item);
  useEffect(() => () => context.items.unregister(item), []);

  return {
    hasFocus: context.currentFocus === item,
    submenuPlacement: context.submenuPlacement,
  };
};
