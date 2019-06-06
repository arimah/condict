/* eslint-disable react/jsx-key */
import React from 'react';

import Demo from '../demo';
import {Switch, Select, Checkbox} from '../../src';

const Intents = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

export default Object.freeze({
  name: 'Switch',
  initialState: {
    checked1: false,
    checked2: true,
    intent: 'primary',
    disabled: false,
  },
  controls: (state, setState, toggleState) => [
    <label>
      Intent: <Select
        value={state.intent}
        options={Intents}
        onChange={e => setState({intent: e.target.value})}
      />
    </label>,
    <Checkbox
      checked={state.disabled}
      label='Disabled'
      onChange={() => toggleState('disabled')}
    />,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: (state, _setState, toggleState) =>
    <Demo.List>
      <Demo.Row>
        <Switch
          intent={state.intent}
          checked={state.checked1}
          disabled={state.disabled}
          label='First option'
          onChange={() => toggleState('checked1')}
        />
      </Demo.Row>
      <Demo.Row>
        <Switch
          intent={state.intent}
          checked={state.checked2}
          disabled={state.disabled}
          label='Second option'
          onChange={() => toggleState('checked2')}
        />
      </Demo.Row>
    </Demo.List>,
});
