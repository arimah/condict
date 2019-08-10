/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {Spinner, NumberInput} from '../../src';

import {ComponentDemo} from './types';

const BlockSpinner = styled(Spinner)`
  display: block;
`;

export type State = {
  sizeString: string;
  size: number;
};

const demo: ComponentDemo<State> = {
  name: 'Spinner',
  initialState: {
    sizeString: '24',
    size: 24,
  },
  controls: (state, setState) => [
    <label>
      Size: <NumberInput
        value={state.sizeString}
        size={2}
        min={10}
        max={250}
        step={1}
        onChange={e => {
          const size = e.target.valueAsNumber;
          const partialState = {
            sizeString: e.target.value,
            size: !Number.isNaN(size) ? size : state.size,
          };
          setState(partialState);
        }}
      />
    </label>,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({size}) => <BlockSpinner size={size}/>,
};

export default demo;
