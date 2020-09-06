/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {Spinner, NumberInput} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  sizeString: string;
  size: number;
};

const InitialState: State = {
  sizeString: '24',
  size: 24,
};

const StorageKey = 'condict/ui/spinner';

const BlockSpinner = styled(Spinner)`
  display: block;
`;

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {sizeString, size} = state;
  return (
    <Demo
      name='Spinner'
      controls={[
        <label>
          Size: <NumberInput
            value={sizeString}
            size={2}
            min={10}
            max={250}
            step={1}
            onChange={e => {
              set('sizeString', e.target.value);
              const size = e.target.valueAsNumber;
              if (!Number.isNaN(size)) {
                set('size', size);
              }
            }}
          />
        </label>,
      ]}
      onReset={reset}
    >
      <BlockSpinner size={size}/>
    </Demo>
  );
};

export default Main;
