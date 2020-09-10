/* eslint-disable react/jsx-key */
import React from 'react';
import styled from 'styled-components';

import {TagInput, Checkbox} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  disabled: boolean;
  minimal: boolean;
  tags: string[];
};

const InitialState: State = {
  disabled: false,
  minimal: false,
  tags: [
    'Food',
    'Emotion',
    'Colour',
    'Not yet classified',
  ],
};

const StorageKey = 'condict/ui/tag-input';

const TagInputWithWidth = styled(TagInput)`
  width: 400px;
`;

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {disabled, minimal, tags} = state;
  return (
    <Demo
      name='TagInput'
      controls={[
        <Checkbox
          checked={disabled}
          label='Disabled'
          onChange={e => set('disabled', e.target.checked)}
        />,
        <Checkbox
          checked={minimal}
          label='Minimal'
          onChange={e => set('minimal', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <TagInputWithWidth
        disabled={disabled}
        minimal={minimal}
        tags={tags}
        onChange={tags => set('tags', tags)}
      />
    </Demo>
  );
};

export default Main;
