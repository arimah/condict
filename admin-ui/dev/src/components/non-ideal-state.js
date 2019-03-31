/* eslint-disable react/jsx-key */
import React from 'react';

import {NonIdealState, Button, Checkbox, Select} from '../../../src';

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
      image={image ? <ConlangFlag/> : undefined}
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

const ConlangFlag = () =>
  <svg
    width={141}
    height={87}
    viewBox='0 0 468 290'
    preserveAspectRatio='xMidYMid meet'
  >
    <rect fill='#ffb700' width='468' height='290' x='0' y='0'/>
    <path
      fill='#000000'
      d='
        M210,119.4 C209.1,120.5 206.7,126.6 207,126.9 C207.4,127.2 256.1,123.1 256.6,122.6 C256.9,122.4 256.6,121.4 256.2,120.4 L255.3,118.6 L233,118.6 L210.6,118.6 L210,119.4 z
        M256.3,125.6 C256,125.7 244.5,126.6 230.7,127.6 C217,128.7 204.2,129.7 202.2,130 L198.6,130.5 L197,133.9 C196.1,135.8 195.2,138.1 194.9,139.1 L194.4,140.9 L196.9,140.6 C198.2,140.3 214.5,138.7 233.2,137 C251.9,135.2 267.3,133.7 267.4,133.5 C267.6,133.3 266.9,131.4 265.9,129.1 L264.1,125 L260.5,125.2 C258.4,125.4 256.6,125.5 256.3,125.6 z
        M261.8,136.7 C258.9,137 240.5,138.7 221.1,140.6 L185.7,143.9 L184.9,144.6 C183.8,145.5 179.7,153.9 180.2,154.3 C180.5,154.7 277.2,145.3 277.8,144.8 C277.9,144.7 277.1,142.7 276,140.4 L273.8,136.3 L270.5,136.2 C268.7,136.1 264.8,136.4 261.8,136.7 z
        M246.7,150.4 C186.8,156.2 171.7,157.7 170.6,158.1 L169.4,158.4 L167.2,163.6 C166,166.5 164.8,169.4 164.6,170.2 L164.2,171.5 L166.5,171.2 C167.8,170.9 196.2,168 229.7,164.8 C263.1,161.5 290.5,158.7 290.6,158.6 C290.8,158.6 289.6,156 288.1,153 L285.4,147.5 L280.3,147.6 C277.5,147.6 262.4,148.9 246.7,150.4 z
        M289.3,161 C278.6,162.4 159.7,174.3 156.3,174.3 L153.6,174.3 L150.7,180.6 L147.8,186.9 L149,187.1 C149.7,187.3 157.3,186.7 165.7,185.9 C201.7,182.4 295.1,173.5 299.7,173 C302.3,172.8 304.7,172.4 304.8,172.2 C305.2,171.6 301.5,162.4 300.3,161 C299.2,159.7 299.5,159.7 289.3,161 z
        M298,175.8 C294.6,176.2 276.4,178 257.5,179.8 C184.2,186.7 135,191.6 134.9,191.8 C132.8,196 128.8,205.7 129.1,205.9 C129.6,206.4 319,190.4 319.6,189.9 C319.8,189.7 318.5,186.3 316.7,182.4 L313.4,175.4 L308.8,175.3 C306.3,175.2 301.4,175.4 298,175.8 z
        M323.3,192.1 C321.2,192.3 279.4,195.8 230.4,199.9 C181.5,204.1 136.3,207.8 130.2,208.3 C91.4,211.1 38.6,221.2 6.5,232 L0,234.1 L0,290 L468,290 L468,237 L457.1,233.4 C427.6,223.5 391.9,215.7 354,210.7 L338.7,208.7 L336,201.2 C334.5,197.1 332.7,193.2 332.2,192.6 L331.2,191.6 L329.3,191.8 C328.2,191.8 325.5,192 323.3,192.1 z
      '
    />
    <path
      fill='#91008c'
      d='M0,220.8 L0.9,220.4 C6,218.6 28.7,211.5 37.3,209.1 C58.9,203.2 100.8,194.9 120.1,192.7 C122.5,192.4 124.6,192 124.7,191.8 C124.9,191.5 124.3,188.7 123.3,185.4 C118.1,167.4 118.1,145.7 123.4,127.5 C131.5,99.5 152.5,75 180.5,61 C188.6,56.9 203.4,52 213,50.2 L220.3,48.9 C220.3,48.9 231.4,47.8 234.4,47.8 C237.1,47.8 248.5,48.9 248.5,48.9 L255.7,50.2 C279.3,54.6 301.7,66.1 317.8,82.1 C325.4,89.7 328.8,94 334.4,102.9 C349.7,127.4 354.2,159.1 346.1,186.9 C345.2,190.1 344.8,193.3 344.7,193.3 C344.7,193.3 345.9,193.7 346.9,193.9 C352.8,195 390.6,201.2 416.6,207.3 C426.2,209.6 451.4,217.5 461.3,221.4 C464.2,222.6 468,223.5 468,223.5 L468,0 L0,0 L0,220.8 z'
    />
  </svg>;
