import React from 'react';

import Demo from '../../demo';

import ScopeDemo from './scope';
import SingleTrapDemo from './single-trap';
import DualTrapDemo from './dual-trap';
import NestedTrapDemo from './nested-trap';
import ScopeInTrapDemo from './scope-in-trap';
import PointerOutsideTrapDemo from './pointer-outside-trap';
import * as S from './styles';

const Main = (): JSX.Element =>
  <Demo name='Focus management'>
    <S.Container>
      <ScopeDemo/>
      <SingleTrapDemo/>
      <DualTrapDemo/>
      <NestedTrapDemo/>
      <ScopeInTrapDemo/>
      <PointerOutsideTrapDemo/>
    </S.Container>
  </Demo>;

export default Main;
