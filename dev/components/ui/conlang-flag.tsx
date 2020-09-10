/* eslint-disable react/jsx-key */
import React from 'react';

import {ConlangFlag} from '@condict/ui';

import Demo from '../demo';

const Main = (): JSX.Element =>
  <Demo name='ConlangFlag'>
    <ConlangFlag width={188} height={116}/>
  </Demo>;

export default Main;
