/* eslint-disable react/jsx-key */
import React from 'react';

import {
  NonIdealState,
  ConlangFlag,
  Button,
  Checkbox,
  Select,
} from '../../../src';

const HeadingLevels = [
  {value: '2', name: '2'},
  {value: '3', name: '3'},
  {value: '4', name: '4'},
  {value: '5', name: '5'},
  {value: '6', name: '6'},
];

export default Object.freeze({
  name: 'NonIdealState',
  initialState: {
    minimal: false,
    headingLevel: 2,
    image: true,
    description: true,
    action: true,
  },
  controls: (state, setState, toggleState) => [
    <Checkbox
      checked={state.minimal}
      label='Minimal'
      onChange={() => toggleState('minimal')}
    />,
    <label>
      Heading level: <Select
        value={String(state.headingLevel)}
        options={HeadingLevels}
        onChange={e => setState({headingLevel: +e.target.value})}
      />
    </label>,
    <Checkbox
      checked={state.image}
      label='With image'
      onChange={() => toggleState('image')}
    />,
    <Checkbox
      checked={state.description}
      label='With description'
      onChange={() => toggleState('description')}
    />,
    <Checkbox
      checked={state.action}
      label='With action'
      onChange={() => toggleState('action')}
    />,
  ],
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: ({minimal, headingLevel, image, description, action}) =>
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
      action={action ? <Button label='Add a language'/> : undefined}
    />,
});
