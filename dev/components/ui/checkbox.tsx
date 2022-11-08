/* eslint-disable react/jsx-key */
import React from 'react';

import {Checkbox, Select, MarkerLocation} from '@condict/ui';

import Demo, {List, Row, useDemoState} from '../demo';
import MarkerLocations from '../marker-location-options';

type State = {
  marker: MarkerLocation;
  disabled: boolean;
  checked: boolean[];
};

const InitialState: State = {
  marker: 'before',
  disabled: false,
  checked: [true, false, false],
};

const StorageKey = 'condict/ui/checkbox';

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {marker, disabled, checked} = state;
  const checkedCount = checked.reduce((a, b) => a + +b, 0);
  return (
    <Demo
      name='Checkbox'
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
      ]}
      onReset={reset}
    >
      <List>
        <Row>
          <Checkbox
            marker={marker}
            disabled={disabled}
            checked={checkedCount === checked.length}
            indeterminate={checkedCount > 0 && checkedCount !== checked.length}
            onChange={() => set(
              'checked',
              checked.map(() => checkedCount !== checked.length)
            )}
          >
            All
          </Checkbox>
        </Row>
        <Row>
          {checked.map((ch, i) => (
            <Checkbox
              key={i}
              marker={marker}
              disabled={disabled}
              checked={ch}
              onChange={() => {
                const newChecked = checked.slice(0);
                newChecked[i] = !ch;
                set('checked', newChecked);
              }}
            >
              Option {i + 1}
            </Checkbox>
          ))}
        </Row>
      </List>
    </Demo>
  );
};

export default Main;
