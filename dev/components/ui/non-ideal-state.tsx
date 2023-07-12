/* eslint-disable react/jsx-key */
import React from 'react';

import {
  NonIdealState,
  ConlangFlag,
  Button,
  Checkbox,
  Select,
  SelectOption,
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

const HeadingLevels: readonly SelectOption<HeadingLevel>[] = [
  {value: 2, name: '2'},
  {value: 3, name: '3'},
  {value: 4, name: '4'},
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
          onChange={e => set('minimal', e.target.checked)}
        >
          Minimal
        </Checkbox>,
        <label>
          Heading level: <Select
            value={headingLevel}
            options={HeadingLevels}
            onChange={headingLevel => set('headingLevel', headingLevel)}
          />
        </label>,
        <Checkbox
          checked={image}
          onChange={e => set('image', e.target.checked)}
        >
          With image
        </Checkbox>,
        <Checkbox
          checked={description}
          onChange={e => set('description', e.target.checked)}
        >
          With description
        </Checkbox>,
        <Checkbox
          checked={action}
          onChange={e => set('action', e.target.checked)}
        >
          With action
        </Checkbox>,
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
        action={
          action
            ? <Button intent='accent'>Add a language</Button>
            : undefined
        }
      />
    </Demo>
  );
};

export default Main;
