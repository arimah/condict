/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';

import {Button, LinkButton, Checkbox, Select, Intent} from '../../src';
import Demo from '../demo';
import {ComponentDemo} from './types';

const Intents = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

export type State = {
  intent: Intent;
  disabled: boolean;
  bold: boolean;
  slim: boolean;
};

const demo: ComponentDemo<State> = {
  name: 'Button',
  initialState: {
    intent: Intent.PRIMARY,
    disabled: false,
    bold: false,
    slim: false,
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
    <Checkbox
      checked={state.bold}
      label='Bold'
      onChange={() => toggleState('bold')}
    />,
    <Checkbox
      checked={state.slim}
      label='Slim'
      onChange={() => toggleState('slim')}
    />,
  ],
  contents: ({intent, disabled, bold, slim}) =>
    <Demo.List>
      <Demo.Row>
        <Button
          intent={intent}
          disabled={disabled}
          bold={bold}
          slim={slim}
          label='Regular button'
        />
        <LinkButton
          intent={intent}
          bold={bold}
          slim={slim}
          label='Link button'
          href='#'
        />
      </Demo.Row>
    </Demo.List>,
};

export default demo;
