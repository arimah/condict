/* eslint-disable react/jsx-key */
import React from 'react';

import {Radio, Select, Checkbox, Button, Intent} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import Intents from '../intent-options';

type State = {
  current: string | null;
  intent: Intent;
  disabled: boolean;
};

const InitialState: State = {
  current: '1',
  intent: 'primary',
  disabled: false,
};

const StorageKey = 'condict/ui/radio';

const Options = ['1', '2', '3', '4'];

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {current, intent, disabled} = state;
  return (
    <Demo
      name='Radio'
      controls={[
        <label>
          Intent: <Select
            value={state.intent}
            options={Intents}
            onChange={e => set('intent', e.target.value as Intent)}
          />
        </label>,
        <Checkbox
          checked={state.disabled}
          label='Disabled'
          onChange={e => set('disabled', e.target.checked)}
        />,
        <Button
          slim
          intent='secondary'
          label='Deselect all'
          onClick={() => set('current', null)}
        />,
      ]}
      onReset={reset}
    >
      <List>
        <Radio.Group>
          {Options.map((value, i) =>
            <Row key={i}>
              <Radio
                checked={current === value}
                disabled={disabled}
                intent={intent}
                value={value}
                label={`Option ${value}`}
                onChange={() => set('current', value)}
              />
            </Row>
          )}
        </Radio.Group>
      </List>
    </Demo>
  );
};

export default Main;
