/* eslint-disable react/jsx-key, react/display-name */
import React, {useMemo, useCallback} from 'react';
import styled from 'styled-components';
import memoizeOne from 'memoize-one';

import {
  Command,
  CommandSpecMap,
  CommandGroup,
  Button,
  Checkbox,
} from '../../src';

import {ComponentDemo, ToggleStateFunc} from './types';

const Group = styled.div`
  padding: 16px;
  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 3px;

  &:focus,
  &.force-focus {
    ${p => p.theme.focus.style}
    border-color: ${p => p.theme.focus.color};
  }
`;

type ResultDisplayProps = {
  italic?: boolean;
  bold?: boolean;
};

const ResultDisplay = styled.div<ResultDisplayProps>`
  font-style: ${p => p.italic && 'italic'};
  font-weight: ${p => p.bold && 'bold'};

  :not(:first-child) {
    margin-top: 8px;
  }

  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

type Props = {
  state: State;
  toggleState: ToggleStateFunc<State>;
};

export type State = {
  outerDisabled: boolean;
  innerDisabled: boolean;
  italicOuter: boolean;
  italicInner: boolean;
  bold: boolean;
};

const CommandDemo = React.memo((props: Props) => {
  const {
    state: {
      outerDisabled,
      innerDisabled,
      italicOuter,
      italicInner,
      bold,
    },
    toggleState,
  } = props;

  const outerCommands = useMemo((): CommandSpecMap => ({
    toggleItalic: {
      shortcut: 'Primary+I i',
      exec: () => 'italicOuter',
    },
    toggleBold: {
      shortcut: 'Primary+B b',
      exec: () => 'bold',
    },
  }), []);

  const innerCommands = useMemo((): CommandSpecMap => ({
    toggleItalic: {
      shortcut: 'Primary+I i',
      exec: () => 'italicInner',
    },
  }), []);

  const execCommand = useCallback((cmd: Command) => {
    toggleState(cmd.exec());
  }, [toggleState]);

  return (
    <CommandGroup
      as={Group}
      tabIndex={0}
      disabled={outerDisabled}
      commands={outerCommands}
      onExec={execCommand}
    >
      <div>
        <Button
          slim
          label='Toggle italic'
          command='toggleItalic'
        />
        {' '}
        <Button
          slim
          label='Toggle bold'
          command='toggleBold'
        />
      </div>
      <ResultDisplay italic={italicOuter} bold={bold}>
        outer state: italic={String(italicOuter)}, bold={String(bold)}
      </ResultDisplay>
      <CommandGroup
        as={Group}
        tabIndex={0}
        disabled={innerDisabled}
        commands={innerCommands}
        onExec={execCommand}
      >
        <div>
          <Button
            slim
            label='Toggle italic (inner)'
            command='toggleItalic'
          />
          {' '}
          <Button
            slim
            label='Toggle bold (outer)'
            command='toggleBold'
          />
        </div>
        <ResultDisplay italic={italicInner}>
          inner state: italic={String(italicInner)}
        </ResultDisplay>
      </CommandGroup>
    </CommandGroup>
  );
});

const demo: ComponentDemo<State> = {
  name: 'Command',
  initialState: {
    outerDisabled: false,
    innerDisabled: false,
    italicOuter: false,
    italicInner: false,
    bold: false,
  },
  controls: (state, _setState, toggleState) => [
    <Checkbox
      checked={state.outerDisabled}
      label='Outer disabled'
      onChange={() => toggleState('outerDisabled')}
    />,
    <Checkbox
      checked={state.innerDisabled}
      label='Inner disabled'
      onChange={() => toggleState('innerDisabled')}
    />,
  ],
  contents: (state, _setState, toggleState) =>
    <CommandDemo
      state={state}
      toggleState={toggleState}
    />,
};

export default demo;
