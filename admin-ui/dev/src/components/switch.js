/* eslint-disable react/jsx-key */
import React from 'react';

import Demo from '../demo';
import {Switch, Select, Checkbox} from '../../../src';

const Intents = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

export default Object.freeze({
  name: 'Switch',
  initialState: {
    checked: false,
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
  contents: ({intent, checked, disabled}, _setState, toggleState) =>
    <Demo.List>
      <Demo.Row>
        <Switch
          intent={intent}
          checked={checked}
          disabled={disabled}
          label='First option'
          onChange={() => toggleState('checked')}
        />
      </Demo.Row>
      <Demo.Row>
        <Switch
          intent={intent}
          checked={!checked}
          disabled={disabled}
          label='Second option'
          onChange={() => toggleState('checked')}
        />
      </Demo.Row>
    </Demo.List>,
});
