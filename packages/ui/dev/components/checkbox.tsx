/* eslint-disable react/jsx-key, react/display-name */
import React from 'react';

import {Checkbox, Select, Intent} from '../../src';
import Demo from '../demo';
import {ComponentDemo} from './types';

const Intents = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

export interface State {
  intent: Intent;
  disabled: boolean;
  checked: boolean[];
}

const demo: ComponentDemo<State> = {
  name: 'Checkbox',
  initialState: {
    intent: Intent.PRIMARY,
    disabled: false,
    checked: [true, false, false],
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
  contents: ({intent, disabled, checked}, setState) => {
    const checkedCount = checked.reduce((a, b) => a + +b, 0);
    return (
      <Demo.List>
        <Demo.Row>
          <Checkbox
            intent={intent}
            disabled={disabled}
            checked={checkedCount === checked.length}
            indeterminate={checkedCount > 0 && checkedCount !== checked.length}
            label='All'
            onChange={() => setState({
              checked: checked.map(() => checkedCount !== checked.length),
            })}
          />
        </Demo.Row>
        <Demo.Row>
          {checked.map((ch, i) => (
            <Checkbox
              key={i}
              intent={intent}
              disabled={disabled}
              checked={ch}
              label={`Option ${i + 1}`}
              onChange={() => {
                const newChecked = checked.slice(0);
                newChecked[i] = !ch;
                setState({checked: newChecked});
              }}
            />
          ))}
        </Demo.Row>
      </Demo.List>
    );
  },
};

export default demo;
