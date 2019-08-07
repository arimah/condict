/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {TagInput, Checkbox} from '../../src';

import {ComponentDemo} from './types';

const TagInputWithWidth = styled(TagInput)`
  width: 400px;
`;

export interface State {
  disabled: boolean;
  minimal: boolean;
  tags: string[];
}

const demo: ComponentDemo<State> = {
  name: 'TagInput',
  initialState: {
    disabled: false,
    minimal: false,
    tags: [
      'Food',
      'Emotion',
      'Colour',
      'Not yet classified',
    ],
  },
  controls: (state, setState, toggleState) => [
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
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({disabled, minimal, tags}, setState) =>
    <TagInputWithWidth
      disabled={disabled}
      minimal={minimal}
      tags={tags}
      onChange={tags => setState({tags})}
    />,
};

export default demo;
