/* eslint-disable react/jsx-key */
import React, {useMemo, useCallback} from 'react';
import styled from 'styled-components';

import {
  Command,
  CommandSpecMap,
  CommandGroup,
  Button,
  Checkbox,
} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

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

type State = {
  outerDisabled: boolean;
  innerDisabled: boolean;
  italicOuter: boolean;
  italicInner: boolean;
  bold: boolean;
};

const InitialState: State = {
  outerDisabled: false,
  innerDisabled: false,
  italicOuter: false,
  italicInner: false,
  bold: false,
};

const StorageKey = 'condict/ui/command';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {
    outerDisabled,
    innerDisabled,
    italicOuter,
    italicInner,
    bold,
  } = state;

  const outerCommands = useMemo((): CommandSpecMap<keyof State> => ({
    toggleItalic: {
      shortcut: 'Primary+I i',
      exec: 'italicOuter',
    },
    toggleBold: {
      shortcut: 'Primary+B b',
      exec: 'bold',
    },
  }), []);

  const innerCommands = useMemo((): CommandSpecMap<keyof State> => ({
    toggleItalic: {
      shortcut: 'Primary+I i',
      exec: 'italicInner',
    },
  }), []);

  const execCommand = useCallback((cmd: Command<keyof State>) => {
    set(cmd.exec, !state[cmd.exec]);
  }, [state, set]);

  return (
    <Demo
      controls={[
        <Checkbox
          checked={state.outerDisabled}
          label='Outer disabled'
          onChange={() => set('outerDisabled', !outerDisabled)}
        />,
        <Checkbox
          checked={state.innerDisabled}
          label='Inner disabled'
          onChange={() => set('innerDisabled', !innerDisabled)}
        />,
      ]}
      onReset={reset}
    >
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
    </Demo>
  );
};

export default Main;
