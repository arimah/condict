/* eslint-disable react/jsx-key */
import React from 'react';

import {
  NonIdealState,
  ConlangFlag,
  Button,
  Checkbox,
  Select,
} from '@condict/ui';

import Demo, {useDemoState} from '../demo';

type State = {
  minimal: boolean;
  headingLevel: HeadingLevel;
  image: boolean;
  description: boolean;
  action: boolean;
};

type HeadingLevel = 2 | 3 | 4;

const InitialState: State = {
  minimal: false,
  headingLevel: 2,
  image: true,
  description: true,
  action: true,
};

const StorageKey = 'condict/ui/non-ideal-state';

const HeadingLevels = [
  {value: '2', name: '2'},
  {value: '3', name: '3'},
  {value: '4', name: '4'},
];

const Main = (): JSX.Element => {
  const {state, set, reset} = useDemoState(StorageKey, InitialState);
  const {minimal, headingLevel, image, description, action} = state;
  return (
    <Demo
      name='NonIdealState'
      controls={[
        <Checkbox
          checked={minimal}
          label='Minimal'
          onChange={e => set('minimal', e.target.checked)}
        />,
        <label>
          Heading level: <Select
            value={String(headingLevel)}
            options={HeadingLevels}
            onChange={e => set('headingLevel', +e.target.value as HeadingLevel)}
          />
        </label>,
        <Checkbox
          checked={image}
          label='With image'
          onChange={e => set('image', e.target.checked)}
        />,
        <Checkbox
          checked={description}
          label='With description'
          onChange={e => set('description', e.target.checked)}
        />,
        <Checkbox
          checked={action}
          label='With action'
          onChange={e => set('action', e.target.checked)}
        />,
      ]}
      onReset={reset}
    >
      <NonIdealState
        minimal={minimal}
        image={image ? <ConlangFlag width={141} height={87}/> : undefined}
        title='Fiat lingua!'
        headingLevel={headingLevel}
        description={
          description
            ? 'Let\u2019s get started \u2013 the first step is to add a language.'
            : undefined
        }
        action={action ? <Button bold intent='accent' label='Add a language'/> : undefined}
      />
    </Demo>
  );
};

export default Main;
