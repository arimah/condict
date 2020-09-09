/* eslint-disable react/jsx-key */
import React from 'react';

import {Button, LinkButton, Select, Checkbox, Intent} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import Intents from '../intent-options';

type State = {
  intent: Intent;
  disabled: boolean;
  bold: boolean;
  slim: boolean;
};

const InitialState: State = {
  intent: 'primary',
  disabled: false,
  bold: false,
  slim: false,
};

const StorageKey = 'condict/ui/button';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {intent, disabled, bold, slim} = state;
  return (
    <Demo
      name='Button'
      controls={[
        <label>
          Intent: <Select
            value={intent}
            options={Intents}
            onChange={e => set('intent', e.target.value as Intent)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          label='Disabled'
          onChange={e => set('disabled', e.target.checked)}
        />,
        <Checkbox
          checked={bold}
          label='Bold'
          onChange={e => set('bold', e.target.checked)}
        />,
        <Checkbox
          checked={slim}
          label='Slim'
          onChange={e => set('slim', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <List>
        <Row>
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
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
