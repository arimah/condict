/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {Spinner, NumberInput} from '../../../src';

const BlockSpinner = styled(Spinner)`
  display: block;
`;

export default Object.freeze({
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
          const partialState = {
            sizeString: e.target.value,
          };
          const size = e.target.valueAsNumber;
          if (!Number.isNaN(size)) {
            partialState.size = size;
          }
          setState(partialState);
        }}
      />
    </label>,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({size}) => <BlockSpinner size={size}/>,
});
