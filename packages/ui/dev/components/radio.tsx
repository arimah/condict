/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';

import {Radio, Select, Checkbox, Button, Intent} from '../../src';

import Demo from '../demo';

import {ComponentDemo} from './types';
import Intents from './intent-options';

const Options = ['1', '2', '3', '4'];

export type State = {
  current: string | null;
  intent: Intent;
  disabled: boolean;
};

const demo: ComponentDemo<State> = {
  name: 'Radio',
  initialState: {
    current: '1',
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
    <Button
      slim
      intent={Intent.SECONDARY}
      label='Deselect all'
      onClick={() => setState({current: null})}
    />,
  ],
  contents: ({current, intent, disabled}, setState) =>
    <Demo.List>
      <Radio.Group>
        {Options.map((value, i) =>
          <Demo.Row key={i}>
            <Radio
              checked={current === value}
              disabled={disabled}
              intent={intent}
              value={value}
              label={`Option ${value}`}
              onChange={() => setState({current: value})}
            />
          </Demo.Row>
        )}
      </Radio.Group>
    </Demo.List>,
};

export default demo;
