/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';

import Demo from '../demo';
import {Switch, Select, Checkbox, Intent} from '../../src';

import {ComponentDemo} from './types';

const Intents = [
  {value: 'primary', name: Intent.PRIMARY},
  {value: 'secondary', name: Intent.SECONDARY},
  {value: 'danger', name: Intent.DANGER},
];

export type State = {
  checked1: boolean;
  checked2: boolean;
  intent: Intent;
  disabled: boolean;
};

const demo: ComponentDemo<State> = {
  name: 'Switch',
  initialState: {
    checked1: false,
    checked2: true,
    intent: Intent.PRIMARY,
    disabled: false,
  },
  controls: (state, setState, toggleState) => [
    <label>
      Intent: <Select
        value={state.intent}
        options={Intents}
        onChange={e => setState({intent: e.target.value as Intent})}
      />
    </label>,
    <Checkbox
      checked={state.disabled}
      label='Disabled'
      onChange={() => toggleState('disabled')}
    />,
  ],
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
};

export default demo;
