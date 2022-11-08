/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {TextInput, TextInputType, Checkbox, Select} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  type: TextInputType;
  disabled: boolean;
  minimal: boolean;
  value: string;
};

const InitialState: State = {
  type: 'text',
  disabled: false,
  minimal: false,
  value: '',
};

const StorageKey = 'condict/ui/text-input';

const MaxWidthTextInput = styled(TextInput)`
  min-width: 100px;
  max-width: 400px;
`;

const Types = [
  {value: 'email', name: 'email'},
  {value: 'password', name: 'password'},
  {value: 'search', name: 'search'},
  {value: 'tel', name: 'tel'},
  {value: 'text', name: 'text'},
  {value: 'url', name: 'url'},
];

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {type, disabled, minimal, value} = state;
  return (
    <Demo
      name='TextInput'
      controls={[
        <label>
          Type: <Select
            value={type}
            options={Types}
            onChange={e => set('type', e.target.value as TextInputType)}
          />
        </label>,
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
      <MaxWidthTextInput
        type={type}
        disabled={disabled}
        minimal={minimal}
        value={value}
        placeholder='Type here...'
        onChange={e => set('value', e.target.value)}
      />
    </Demo>
  );
};

export default Main;
