/* eslint-disable react/display-name */
import React from 'react';

import {ComponentDemo} from '../types';

import ScopeDemo from './scope';
import SingleTrapDemo from './single-trap';
import DualTrapDemo from './dual-trap';
import NestedTrapDemo from './nested-trap';
import ScopeInTrapDemo from './scope-in-trap';
import PointerOutsideTrapDemo from './pointer-outside-trap';
import * as S from './styles';

const demo: ComponentDemo = {
  name: 'Focus management',
  initialState: {},
  contents: () =>
    <S.Container>
      <ScopeDemo/>
      <SingleTrapDemo/>
      <DualTrapDemo/>
      <NestedTrapDemo/>
      <ScopeInTrapDemo/>
      <PointerOutsideTrapDemo/>
    </S.Container>,
};

export default demo;
