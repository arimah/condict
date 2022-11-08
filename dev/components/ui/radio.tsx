/* eslint-disable react/jsx-key */
import React from 'react';

import {Radio, Select, Checkbox, Button, MarkerLocation} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import MarkerLocations from '../marker-location-options';

type State = {
  current: string | null;
  marker: MarkerLocation;
  disabled: boolean;
};

const InitialState: State = {
  current: '1',
  marker: 'before',
  disabled: false,
};

const StorageKey = 'condict/ui/radio';

const Options = ['1', '2', '3', '4'];

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {current, marker, disabled} = state;
  return (
    <Demo
      name='Radio'
      controls={[
        <label>
          Marker: <Select
            value={marker}
            options={MarkerLocations}
            onChange={e => set('marker', e.target.value as MarkerLocation)}
          />
        </label>,
        <Checkbox
          checked={disabled}
          onChange={e => set('disabled', e.target.checked)}
        >
          Disabled
        </Checkbox>,
        <Button
          slim
          onClick={() => set('current', null)}
        >
          Deselect all
        </Button>,
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
                marker={marker}
                value={value}
                onChange={() => set('current', value)}
              >
                Option {value}
              </Radio>
            </Row>
          )}
        </Radio.Group>
      </List>
    </Demo>
  );
};

export default Main;
