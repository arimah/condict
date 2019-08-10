/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';

import {NumberInput, Checkbox} from '../../src';

import {ComponentDemo} from './types';

export type State = {
  disabled: boolean;
  minimal: boolean;
  value: string;
};

const demo: ComponentDemo<State> = {
  name: 'NumberInput',
  initialState: {
    disabled: false,
    minimal: false,
    value: '0',
  },
  controls: (state, _setState, toggleState) => [
    <Checkbox
      checked={state.disabled}
      label='Disabled'
      onChange={() => toggleState('disabled')}
    />,
    <Checkbox
      checked={state.minimal}
      label='Minimal'
      onChange={() => toggleState('minimal')}
    />,
  ],
  contents: ({disabled, minimal, value}, setState) =>
    <NumberInput
      disabled={disabled}
      minimal={minimal}
      value={value}
      min={-100}
      max={100}
      onChange={e => setState({value: e.target.value})}
    />,
};

export default demo;
