/* eslint-disable react/jsx-key */
import React from 'react';

import {Select, Checkbox} from '../../../src';

const Options = [
  {value: 'a', name: 'Option A'},
  {value: 'b', name: 'Option B'},
  {value: 'c', name: 'Option C'},
];

export default Object.freeze({
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
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({disabled, minimal, value}, setState) =>
    <Select
      disabled={disabled}
      minimal={minimal}
      value={value}
      options={Options}
      onChange={e => setState({value: e.target.value})}
    />,
});
