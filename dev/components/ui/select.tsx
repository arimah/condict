/* eslint-disable react/jsx-key */
import React from 'react';

import {Select, Checkbox} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  disabled: boolean;
  minimal: boolean;
  value: string;
};

const InitialState: State = {
  disabled: false,
  minimal: false,
  value: '',
};

const StorageKey = 'condict/ui/select';

const Options = [
  {value: 'a', name: 'Option A'},
  {value: 'b', name: 'Option B'},
  {value: 'c', name: 'Option C'},
];

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {disabled, minimal, value} = state;
  return (
    <Demo
      name='Select'
      controls={[
        <Checkbox
          checked={state.disabled}
          onChange={e => set('disabled', e.target.checked)}
        >
          Disabled
        </Checkbox>,
        <Checkbox
          checked={state.minimal}
          onChange={e => set('minimal', e.target.checked)}
        >
          Minimal
        </Checkbox>,
      ]}
      onReset={reset}
    >
      <Select
        disabled={disabled}
        minimal={minimal}
        value={value}
        options={Options}
        onChange={e => set('value', e.target.value)}
      />
    </Demo>
  );
};

export default Main;
