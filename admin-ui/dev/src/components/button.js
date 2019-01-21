/* eslint-disable react/jsx-key */
import React from 'react';

import {Button, Checkbox, Select} from '../../../src';
import Demo from '../demo';

const Intents = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

export default Object.freeze({
  name: 'Button',
  initialState: {
    intent: 'primary',
    disabled: false,
    minimal: false,
    slim: false,
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
    <Checkbox
      checked={state.minimal}
      label='Minimal'
      onChange={() => toggleState('minimal')}
    />,
    <Checkbox
      checked={state.slim}
      label='Slim'
      onChange={() => toggleState('slim')}
    />,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({intent, disabled, minimal, slim}) =>
    <Demo.List>
      <Demo.Row>
        <Button
          intent={intent}
          disabled={disabled}
          minimal={minimal}
          slim={slim}
          label='Regular button'
        />
        <Button
          intent={intent}
          disabled={disabled}
          minimal={minimal}
          slim={slim}
          label='Link button'
          href='#'
        />
      </Demo.Row>
    </Demo.List>,
});
