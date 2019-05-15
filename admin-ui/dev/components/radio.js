/* eslint-disable react/jsx-key */
import React from 'react';

import Demo from '../demo';
import {Radio, Select, Checkbox, Button} from '../../src';

const Intents = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

const Options = ['1', '2', '3', '4'];

export default Object.freeze({
  name: 'Radio',
  initialState: {
    current: '1',
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
    <Button
      slim
      intent='secondary'
      label='Deselect all'
      onClick={() => setState({current: null})}
    />,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
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
});
