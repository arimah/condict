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
  Shortcut,
} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

import * as S from './styles';

type ResultDisplayProps = {
  italic?: boolean;
  bold?: boolean;
};

const ResultDisplay = styled.div<ResultDisplayProps>`
  margin-top: 8px;
  margin-bottom: 8px;
  font-style: ${p => p.italic && 'italic'};
  font-weight: ${p => p.bold && 'bold'};
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
    shortcut: Shortcut.parse('Primary+I i'),
    action: 'italicOuter',
  },
  toggleBold: {
    shortcut: Shortcut.parse('Primary+B b'),
    action: 'bold',
  },
};

const InnerCommands: CommandSpecMap<keyof State> = {
  toggleItalic: {
    shortcut: Shortcut.parse('Primary+I i'),
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
          onChange={() => set('outerDisabled', !outerDisabled)}
        >
          Outer disabled
        </Checkbox>,
        <Checkbox
          checked={state.innerDisabled}
          onChange={() => set('innerDisabled', !innerDisabled)}
        >
          Inner disabled
        </Checkbox>,
      ]}
      onReset={reset}
    >
      <S.Panel tabIndex={0} onKeyDown={handleOuterKeyDown}>
        <CommandProvider commands={outerCommands}>
          <div>
            <Button slim intent='accent' command='toggleItalic'>
              Toggle italic
            </Button>
            {' '}
            <Button slim intent='accent' command='toggleBold'>
              Toggle bold
            </Button>
          </div>
          <ResultDisplay italic={italicOuter} bold={bold}>
            outer state: italic={String(italicOuter)}, bold={String(bold)}
          </ResultDisplay>
          <S.Panel tabIndex={0} onKeyDown={handleInnerKeyDown}>
            <CommandProvider commands={innerCommands}>
              <div>
                <Button slim intent='accent' command='toggleItalic'>
                  Toggle italic (inner)
                </Button>
                {' '}
                <Button slim intent='accent' command='toggleBold'>
                  Toggle bold (outer)
                </Button>
              </div>
              <ResultDisplay italic={italicInner}>
                inner state: italic={String(italicInner)}
              </ResultDisplay>
            </CommandProvider>
          </S.Panel>
        </CommandProvider>
      </S.Panel>
    </Demo>
  );
};

export default Main;
