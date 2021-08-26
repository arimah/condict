import React, {
  Ref,
  RefObject,
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';
import {Descendants, compareNodes} from '../descendants';
import {WritingDirection, useWritingDirection} from '../writing-direction';
import combineRefs from '../combine-refs';

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

const getKeyboardMap = (dir: WritingDirection) => new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse(dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'),
      exec({descendants, activeChild}) {
        const prev = activeChild && Descendants.prevWrapping(
          descendants,
          activeChild,
          isEnabled
        );
        prev?.current?.focus();
      },
    },
    {
      key: Shortcut.parse(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'),
      exec({descendants, activeChild}) {
        const next = activeChild && Descendants.nextWrapping(
          descendants,
          activeChild,
          isEnabled
        );
        next?.current?.focus();
      },
    },
    {
      key: Shortcut.parse(['Home', 'Shift+Home']),
      exec({descendants}) {
        Descendants.first(descendants, isEnabled)?.current?.focus();
      },
    },
    {
      key: Shortcut.parse(['End', 'Shift+End']),
      exec({descendants}) {
        Descendants.last(descendants, isEnabled)?.current?.focus();
      },
    },
  ],
  cmd => cmd.key
);

const getValidFocus = (
  descendants: Descendants<RefObject<ItemElement>>,
  activeChild: RefObject<ItemElement> | null
): RefObject<ItemElement> | null => {
  if (
    !activeChild ||
    !activeChild.current ||
    !Descendants.first(descendants, r => r.current == activeChild.current)
  ) {
    // Either there is no current focus, or the current focus is not a child
    // of this toolbar. Focus the first element.
    return Descendants.first(descendants, isEnabled);
  } else if (activeChild.current.disabled) {
    // The current focus has become disabled. Move focus to the another
    // element. We try to first to find the previous toolbar item. If there
    // are no previous enabled items, move to the *next* item instead. This
    // prevents needless wrapping and in most cases should keep the new
    // focus as close as possible to the previous.
    return (
      Descendants.prev(descendants, activeChild, isEnabled) ||
      Descendants.next(descendants, activeChild, isEnabled)
    );
  }
  return activeChild;
};

export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'role'>;

export const Toolbar = Object.assign(
  // eslint-disable-next-line react/display-name
  React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
    const {onFocus, onKeyDown, children, ...otherProps} = props;

    const dir = useWritingDirection();

    const [descendants] = useState(() =>
      Descendants.create<RefObject<ItemElement>>(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (a, b) => compareNodes(a.current!, b.current!)
      )
    );
    const [activeChild, setActiveChild] = useState<RefObject<ItemElement> | null>(null);

    const context = useMemo<ContextValue>(() => ({
      descendants,
      activeChild,
    }), [activeChild]);

    const handleFocus = useCallback((e: FocusEvent<HTMLDivElement>) => {
      const ref = Descendants.first(
        descendants,
        r => r.current !== null && r.current.contains(e.target)
      );
      if (ref) {
        setActiveChild(ref);
      }
      if (onFocus) {
        onFocus.call(e.currentTarget, e);
      }
    }, [onFocus]);

    const keyboardMap = useMemo(() => getKeyboardMap(dir), [dir]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
      const command = keyboardMap.get(e);
      if (command) {
        e.preventDefault();
        e.stopPropagation();
        command.exec(context);
      }
    }, [context, onKeyDown, keyboardMap]);

    const ownRef = useRef<HTMLDivElement>(null);
    const hadFocus = ownRef.current?.contains(document.activeElement);

    // After rendering, ensure the current item is one of the enabled children
    // of the toolbar. If you press a Redo button that then becomes disabled
    // because the redo stack is empty, we have to move the focus to something
    // else, otherwise the toolbar itself becomes unfocusable.
    // If the toolbar layout changes, focus may be on a former child of the
    // toolbar, which is also unacceptable.
    // Also, on mount, once we've collected all the children, we need to make
    // the first one focusable.
    useEffect(() => {
      const nextFocus = getValidFocus(descendants, activeChild);
      // Avoid infinite update loops.
      if (nextFocus !== activeChild) {
        setActiveChild(nextFocus);

        // If the toolbar had focus and has now lost it, repair it by focusing
        // the next focusable.
        if (hadFocus) {
          nextFocus?.current?.focus();
        }
      }
    });

    return (
      <Context.Provider value={context}>
        <S.Toolbar
          {...otherProps}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          ref={combineRefs(ref, ownRef)}
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
