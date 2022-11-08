/* eslint-disable react/jsx-key */
import React from 'react';

import {NumberInput, Checkbox} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  disabled: boolean;
  minimal: boolean;
  value: string;
};

const InitialState: State = {
  disabled: false,
  minimal: false,
  value: '0',
};

const StorageKey = 'condict/ui/number-input';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {disabled, minimal, value} = state;
  return (
    <Demo
      name='NumberInput'
      controls={[
        <Checkbox
          checked={disabled}
          onChange={e => set('disabled', e.target.checked)}
        >
          Disabled
        </Checkbox>,
        <Checkbox
          checked={minimal}
          onChange={e => set('minimal', e.target.checked)}
        >
          Minimal
        </Checkbox>,
      ]}
      onReset={reset}
    >
      <NumberInput
        disabled={disabled}
        minimal={minimal}
        value={value}
        min={-100}
        max={100}
        onChange={e => set('value', e.target.value)}
      />
    </Demo>
  );
};

export default Main;
