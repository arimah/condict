/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';

import {Select, Checkbox} from '../../src';

import {ComponentDemo} from './types';

const Options = [
  {value: 'a', name: 'Option A'},
  {value: 'b', name: 'Option B'},
  {value: 'c', name: 'Option C'},
];

export type State = {
  disabled: boolean;
  minimal: boolean;
  value: string;
};

const demo: ComponentDemo<State> = {
  name: 'Select',
  initialState: {
    disabled: false,
    minimal: false,
    value: '',
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
    <Select
      disabled={disabled}
      minimal={minimal}
      value={value}
      options={Options}
      onChange={e => setState({value: e.target.value})}
    />,
};

export default demo;
