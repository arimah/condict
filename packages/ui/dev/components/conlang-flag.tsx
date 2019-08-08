/* eslint-disable react/jsx-key */
import React from 'react';

import {ConlangFlag} from '../../src';
import {ComponentDemo} from './types';

const demo: ComponentDemo<{}> = {
  name: 'ConlangFlag',
  initialState: {},
  // eslint-disable-next-line react/prop-types, react/display-name
  contents: () => <ConlangFlag width={188} height={116}/>,
};

export default demo;
