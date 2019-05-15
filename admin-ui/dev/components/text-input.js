/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {TextInput, Checkbox, Select} from '../../src';

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

export default Object.freeze({
  name: 'TextInput',
  initialState: {
    type: 'text',
    disabled: false,
    minimal: false,
    autoSize: false,
    value: '',
  },
  controls: (state, setState, toggleState) => [
    <label>
      {'Type: '}
      <Select
        value={state.type}
        options={Types}
        onChange={e => setState({type: e.target.value})}
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
    <Checkbox
      checked={state.autoSize}
      label='Auto-size'
      onChange={() => toggleState('autoSize')}
    />,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({type, disabled, minimal, autoSize, value}, setState) =>
    <MaxWidthTextInput
      type={type}
      disabled={disabled}
      minimal={minimal}
      autoSize={autoSize}
      value={value}
      placeholder='Type here...'
      onChange={e => setState({value: e.target.value})}
    />,
});
