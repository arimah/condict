/* eslint-disable react/jsx-key */
import React from 'react';

import {NumberInput, Checkbox} from '../../../src';

export default Object.freeze({
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
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({disabled, minimal, value}, setState) =>
    <NumberInput
      disabled={disabled}
      minimal={minimal}
      value={value}
      min={-100}
      max={100}
      onChange={e => setState({value: e.target.value})}
    />,
});
