/* eslint-disable react/jsx-key */
import React, {KeyboardEvent, useCallback} from 'react';
import styled from 'styled-components';

import {
  CommandSpecMap,
  CommandGroup,
  CommandProvider,
  Button,
  Checkbox,
  useCommandGroup,
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

const OuterCommands: CommandSpecMap<keyof State> = {
  toggleItalic: {
    shortcut: 'Primary+I i',
    action: 'italicOuter',
  },
  toggleBold: {
    shortcut: 'Primary+B b',
    action: 'bold',
  },
};

const InnerCommands: CommandSpecMap<keyof State> = {
  toggleItalic: {
    shortcut: 'Primary+I i',
    action: 'italicInner',
  },
};

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {
    outerDisabled,
    innerDisabled,
    italicOuter,
    bold,
    italicInner,
  } = state;

  const execCommand = useCallback((cmd: keyof State) => {
    set(cmd, !state[cmd]);
  }, [state, set]);

  const outerCommands = useCommandGroup({
    commands: OuterCommands,
    disabled: outerDisabled,
    exec: execCommand,
  });

  const handleOuterKeyDown = useCallback((e: KeyboardEvent) => {
    CommandGroup.handleKey(outerCommands, e);
  }, [outerCommands]);

  const innerCommands = useCommandGroup({
    commands: InnerCommands,
    disabled: innerDisabled,
    exec: execCommand,
  });

  const handleInnerKeyDown = useCallback((e: KeyboardEvent) => {
    CommandGroup.handleKey(innerCommands, e);
  }, [innerCommands]);

  return (
    <Demo
      name='Command'
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
      <Group tabIndex={0} onKeyDown={handleOuterKeyDown}>
        <CommandProvider commands={outerCommands}>
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
          <Group tabIndex={0} onKeyDown={handleInnerKeyDown}>
            <CommandProvider commands={innerCommands}>
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
            </CommandProvider>
          </Group>
        </CommandProvider>
      </Group>
    </Demo>
  );
};

export default Main;
