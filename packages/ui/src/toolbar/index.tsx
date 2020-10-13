import React, {
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  RefObject,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';
import {Descendants, compareNodes} from '../descendants';

import {Context, ContextValue, ItemElement} from './focus-manager';
import Button from './button';
import Group from './group';
import MenuButton from './menu-button';
import RadioButton, {RadioGroup} from './radio-button';
import Select from './select';
import * as S from './styles';

type KeyCommand = {
  key: Shortcut | null;
  exec(context: ContextValue): void;
};

const isEnabled = (item: RefObject<ItemElement>): boolean =>
  item.current !== null && !item.current.disabled;

const KeyboardMap = new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse('ArrowLeft'),
      exec({descendants, currentFocus}) {
        const prev = currentFocus && Descendants.prevWrapping(
          descendants,
          currentFocus,
          isEnabled
        );
        if (prev && prev.current) {
          prev.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse('ArrowRight'),
      exec({descendants, currentFocus}) {
        const next = currentFocus && Descendants.nextWrapping(
          descendants,
          currentFocus,
          isEnabled
        );
        if (next && next.current) {
          next.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse(['Home', 'Shift+Home']),
      exec({descendants}) {
        const first = Descendants.first(descendants, isEnabled);
        if (first && first.current) {
          first.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse(['End', 'Shift+End']),
      exec({descendants}) {
        const last = Descendants.last(descendants, isEnabled);
        if (last && last.current) {
          last.current.focus();
        }
      },
    },
  ],
  cmd => cmd.key
);

const getValidFocus = (
  descendants: Descendants<RefObject<ItemElement>>,
  currentFocus: RefObject<ItemElement> | null
): RefObject<ItemElement> | null => {
  if (
    !currentFocus ||
    !currentFocus.current ||
    !Descendants.first(descendants, r => r.current == currentFocus.current)
  ) {
    // Either there is no current focus, or the current focus is not a child
    // of this toolbar. Focus the first element.
    return Descendants.first(descendants, isEnabled);
  } else if (currentFocus.current.disabled) {
    // The current focus has become disabled. Move focus to the another
    // element. We try to first to find the previous toolbar item. If there
    // are no previous enabled items, move to the *next* item instead. This
    // prevents needless wrapping and in most cases should keep the new
    // focus as close as possible to the previous.
    return (
      Descendants.prev(descendants, currentFocus, isEnabled) ||
      Descendants.next(descendants, currentFocus, isEnabled)
    );
  }
  return currentFocus;
};

export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'role'>;

export const Toolbar = Object.assign(
  // eslint-disable-next-line react/display-name
  React.forwardRef<HTMLDivElement, Props>((
    props: Props,
    ref
  ) => {
    const {onFocus, onKeyDown, children, ...otherProps} = props;

    const [descendants] = useState(() =>
      Descendants.create<RefObject<ItemElement>>(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (a, b) => compareNodes(a.current!, b.current!)
      )
    );
    const [currentFocus, setCurrentFocus] = useState<RefObject<ItemElement> | null>(null);

    const contextValue = useMemo(() => ({
      descendants,
      currentFocus,
    }), [currentFocus]);

    const handleFocus = useCallback((e: FocusEvent<HTMLDivElement>) => {
      const ref = Descendants.first(
        descendants,
        r => r.current !== null && r.current.contains(e.target)
      );
      if (ref) {
        setCurrentFocus(ref);
      }
      if (onFocus) {
        onFocus.call(e.currentTarget, e);
      }
    }, [onFocus]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
      const command = KeyboardMap.get(e);
      if (command) {
        e.preventDefault();
        e.stopPropagation();
        command.exec(contextValue);
      }
    }, [contextValue, onKeyDown]);

    // After rendering, ensure the current item is one of the enabled children
    // of the toolbar. If you press a Redo button that then becomes disabled
    // because the redo stack is empty, we have to move the focus to something
    // else, otherwise the toolbar itself becomes unfocusable.
    // If the toolbar layout changes, focus may be on a former child of the
    // toolbar, which is also unacceptable.
    // Also, on mount, once we've collected all the children, we need to make
    // the first one focusable.
    useEffect(() => {
      const nextFocus = getValidFocus(descendants, currentFocus);
      // Avoid infinite update loops.
      if (nextFocus !== currentFocus) {
        setCurrentFocus(nextFocus);
      }
    });

    return (
      <Context.Provider value={contextValue}>
        <S.Toolbar
          {...otherProps}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          ref={ref}
        >
          {children}
        </S.Toolbar>
      </Context.Provider>
    );
  }),
  {
    Button,
    Group,
    MenuButton,
    RadioButton,
    RadioGroup,
    Select,
    Spacer: S.Spacer,
  }
);

Toolbar.displayName = 'Toolbar';
