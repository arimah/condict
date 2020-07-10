/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';
import styled from 'styled-components';

import {TextInput, TextInputType, Checkbox, Select} from '../../src';

import {ComponentDemo} from './types';

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

export type State = {
  type: TextInputType;
  disabled: boolean;
  minimal: boolean;
  value: string;
};

const demo: ComponentDemo<State> = {
  name: 'TextInput',
  initialState: {
    type: 'text',
    disabled: false,
    minimal: false,
    value: '',
  },
  controls: (state, setState, toggleState) => [
    <label>
      {'Type: '}
      <Select
        value={state.type}
        options={Types}
        onChange={e => setState({type: e.target.value as TextInputType})}
      />
    </label>,
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
  contents: ({type, disabled, minimal, value}, setState) =>
    <MaxWidthTextInput
      type={type}
      disabled={disabled}
      minimal={minimal}
      value={value}
      placeholder='Type here...'
      onChange={e => setState({value: e.target.value})}
    />,
};

export default demo;
