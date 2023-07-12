/* eslint-disable react/jsx-key */
import React from 'react';

import {Switch, Select, Checkbox, MarkerLocation} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import MarkerLocations from '../marker-location-options';

type State = {
  checked1: boolean;
  checked2: boolean;
  marker: MarkerLocation;
  disabled: boolean;
};

const InitialState: State = {
  checked1: false,
  checked2: true,
  marker: 'before',
  disabled: false,
};

const StorageKey = 'condict/ui/switch';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {checked1, checked2, marker, disabled} = state;
  return (
    <Demo
      name='Switch'
      controls={[
        <label>
          Marker: <Select
            value={marker}
            options={MarkerLocations}
            onChange={marker => set('marker', marker)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          onChange={e => set('disabled', e.target.checked)}
        >
          Disabled
        </Checkbox>,
      ]}
      onReset={reset}
    >
      <List>
        <Row>
          <Switch
            marker={marker}
            checked={checked1}
            disabled={disabled}
            onChange={e => set('checked1', e.target.checked)}
          >
            First option
          </Switch>
        </Row>
        <Row>
          <Switch
            marker={marker}
            checked={checked2}
            disabled={disabled}
            onChange={e => set('checked2', e.target.checked)}
          >
            Second option
          </Switch>
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
