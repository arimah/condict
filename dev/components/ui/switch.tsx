/* eslint-disable react/jsx-key */
import React from 'react';

import {Switch, Select, Checkbox, Intent, MarkerLocation} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import Intents from '../intent-options';
import MarkerLocations from '../marker-location-options';

type State = {
  checked1: boolean;
  checked2: boolean;
  intent: Intent;
  marker: MarkerLocation;
  disabled: boolean;
};

const InitialState: State = {
  checked1: false,
  checked2: true,
  intent: 'accent',
  marker: 'before',
  disabled: false,
};

const StorageKey = 'condict/ui/switch';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {checked1, checked2, intent, marker, disabled} = state;
  return (
    <Demo
      name='Switch'
      controls={[
        <label>
          Intent: <Select
            value={intent}
            options={Intents}
            onChange={e => set('intent', e.target.value as Intent)}
          />
        </label>,
        <label>
          Marker: <Select
            value={marker}
            options={MarkerLocations}
            onChange={e => set('marker', e.target.value as MarkerLocation)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          label='Disabled'
          onChange={e => set('disabled', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <List>
        <Row>
          <Switch
            intent={intent}
            marker={marker}
            checked={checked1}
            disabled={disabled}
            label='First option'
            onChange={e => set('checked1', e.target.checked)}
          />
        </Row>
        <Row>
          <Switch
            intent={intent}
            marker={marker}
            checked={checked2}
            disabled={disabled}
            label='Second option'
            onChange={e => set('checked2', e.target.checked)}
          />
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
