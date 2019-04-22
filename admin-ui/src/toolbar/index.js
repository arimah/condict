import React, {useState, useMemo, useEffect} from 'react';
import PropTypes from 'prop-types';

import {Shortcut, ShortcutMap} from '../command/shortcut';
import DescendantCollection from '../descendant-collection';

import {Context} from './focus-manager';
import Button from './button';
import Group from './group';
import MenuButton from './menu-button';
import RadioButton, {RadioGroup} from './radio-button';
import Select from './select';
import * as S from './styles';

const KeyboardMap = new ShortcutMap(
  [
    {
      key: Shortcut.parse('ArrowLeft'),
      exec: ({descendants, currentFocus}) => {
        const prev = descendants.getPrevious(currentFocus);
        if (prev) {
          prev.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse('ArrowRight'),
      exec: ({descendants, currentFocus}) => {
        const next = descendants.getNext(currentFocus);
        if (next) {
          next.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse(['Home', 'Shift+Home']),
      exec: ({descendants}) => {
        const first = descendants.getFirstEnabled();
        if (first) {
          first.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse(['End', 'Shift+End']),
      exec: ({descendants}) => {
        const last = descendants.getLastEnabled();
        if (last) {
          last.current.focus();
        }
      },
    },
  ],
  cmd => cmd.key
);

export const Toolbar = React.forwardRef((props, ref) => {
  const {className, children} = props;

  const [descendants] = useState(() =>
    new DescendantCollection(d => d.current)
  );
  const [currentFocus, setCurrentFocus] = useState(null);

  const contextValue = useMemo(() => ({
    descendants,
    currentFocus,
  }), [currentFocus]);

  // On mount, once we've collected all the children, find the first one and
  // move focus (or nonnegative tab index) to it. This means the toolbar will
  // re-render immediately after first render, but I can't find a better
  // solution to this problem that *doesn't* result in hideous logic.
  useEffect(() => {
    setCurrentFocus(descendants.getFirstEnabled());
  }, []);

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
});

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Toolbar.defaultProps = {
  className: '',
  children: undefined,
};

Object.assign(Toolbar, {
  Button,
  Group,
  MenuButton,
  RadioButton,
  RadioGroup,
  Select,
  Spacer: S.Spacer,
});
