import React, {ReactNode, useState, useCallback} from 'react';

import {Button, useUniqueId} from '@condict/ui';

import * as S from './styles';

export type Props = {
  name: string;
  alignX?: 'center' | 'stretch';
  alignY?: 'center' | 'stretch';
  controls?: readonly ReactNode[];
  onReset?: () => void;
  children: ReactNode;
};

const Demo = (props: Props): JSX.Element => {
  const {
    name,
    alignX = 'center',
    alignY = 'center',
    controls = [],
    onReset,
    children,
  } = props;

  const headingId = useUniqueId();

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{name}</h2>

      <S.Outer>
        <S.Main alignX={alignX} alignY={alignY}>
          {children}
        </S.Main>
        {controls.length > 0 || onReset ? (
          <S.Controls>
            {controls.map((control, i) =>
              <S.Control key={i}>
                {control}
              </S.Control>
            )}
            <S.Control>
              <Button slim intent='bold' onClick={onReset}>
                Reset
              </Button>
            </S.Control>
          </S.Controls>
        ) : null}
      </S.Outer>
    </section>
  );
};

export default Demo;

export interface DemoState<T> {
  readonly state: T;
  readonly set: <K extends keyof T>(key: K, value: T[K]) => void;
  readonly reset: () => void;
}

function readState<T>(storageKey: string, initialState: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(storageKey);
      if (value != null) {
        return JSON.parse(value) as T;
      }
    }
    return initialState;
  } catch (e) {
    return initialState;
  }
}

function writeState<T>(storageKey: string, state: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  } catch (e) {
    // ignore
  }
}

export function useDemoState<T>(
  storageKey: string,
  initialState: T
): DemoState<T> {
  const [state, setState] = useState(() =>
    readState(storageKey, initialState)
  );

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]): void => {
    setState(state => {
      if (state[key] === value) {
        return state;
      }

      const nextState = {
        ...state,
        [key]: value,
      };
      writeState(storageKey, nextState);
      return nextState;
    });
  }, [storageKey]);

  const reset = useCallback((): void => {
    setState(initialState);
    writeState(storageKey, initialState);
  }, [storageKey]);

  return {state, set, reset};
}

export const List = S.List;
export const Row = S.Row;
