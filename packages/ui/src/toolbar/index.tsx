import React, {ReactNode, RefObject, useState, useMemo, useEffect} from 'react';

import {Shortcut, ShortcutMap, ShortcutType} from '../command/shortcut';
import DescendantCollection from '../descendant-collection';

import {Context, ContextValue, Descendants, ItemElement} from './focus-manager';
import Button from './button';
import Group from './group';
import MenuButton from './menu-button';
import RadioButton, {RadioGroup} from './radio-button';
import Select from './select';
import * as S from './styles';

const DOCUMENT_POSITION_PRECEDING = 2;

interface KeyCommand {
  key: ShortcutType | null;
  exec(context: ContextValue): void;
}

const KeyboardMap = new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse('ArrowLeft'),
      exec({descendants, currentFocus}) {
        const prev = currentFocus && descendants.getPrevious(currentFocus);
        if (prev && prev.current) {
          prev.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse('ArrowRight'),
      exec({descendants, currentFocus}) {
        const next = currentFocus && descendants.getNext(currentFocus);
        if (next && next.current) {
          next.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse(['Home', 'Shift+Home']),
      exec({descendants}) {
        const first = descendants.getFirstEnabled();
        if (first && first.current) {
          first.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse(['End', 'Shift+End']),
      exec({descendants}) {
        const last = descendants.getLastEnabled();
        if (last && last.current) {
          last.current.focus();
        }
      },
    },
  ],
  cmd => cmd.key
);

const getValidFocus = (
  descendants: Descendants,
  currentFocus: RefObject<ItemElement> | null
): RefObject<ItemElement> | null => {
  if (
    !currentFocus ||
    !currentFocus.current ||
    !descendants.findManagedRef(currentFocus.current)
  ) {
    // Either there is on current focus, or the current focus is not a child
    // of this toolbar. Focus the first element.
    return descendants.getFirstEnabled();
  } else if (currentFocus.current.disabled) {
    // The current focus has become disabled. Move focus to the another
    // element. We try to first to find the previous toolbar item, which
    // *may* wrap around the end - e.g. if there are no previous enabled
    // items. If the previous item comes *after* the current item (which
    // we find out by comparing document order), move to the *next* item
    // instead. This prevents needless wrapping and in most cases should
    // keep the new focus as close as possible to the previous.
    let nextFocus = descendants.getPrevious(currentFocus);
    const relativePos =
      nextFocus &&
      nextFocus.current &&
      nextFocus.current.compareDocumentPosition(currentFocus.current) ||
      0;
    if (nextFocus && (relativePos & DOCUMENT_POSITION_PRECEDING) !== 0) {
      // currentFocus comes before nextFocus; use the next focusable instead.
      nextFocus = descendants.getNext(currentFocus);
    }

    return nextFocus;
  }
  return currentFocus;
};

export interface Props {
  className?: string;
  children: ReactNode;
}

export const Toolbar = Object.assign(
  // eslint-disable-next-line react/display-name
  React.forwardRef<HTMLDivElement, Props>((
    props: Props,
    ref
  ) => {
    const {className, children} = props;

    const [descendants] = useState(() =>
      new DescendantCollection<RefObject<ItemElement>, ItemElement>(
        d => {
          if (!d.current) {
            throw new Error('Toolbar item has been unmounted but not removed from descendant collection');
          }
          return d.current;
        }
      )
    );
    const [currentFocus, setCurrentFocus] = useState<RefObject<ItemElement> | null>(null);

    const contextValue = useMemo(() => ({
      descendants,
      currentFocus,
    }), [currentFocus]);

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
          className={className}
          onFocus={e => {
            const ref = descendants.findManagedRef(e.target);
            if (ref) {
              setCurrentFocus(ref);
            }
          }}
          onKeyDown={e => {
            const command = KeyboardMap.get(e);
            if (command) {
              e.preventDefault();
              e.stopPropagation();
              command.exec(contextValue);
            }
          }}
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
