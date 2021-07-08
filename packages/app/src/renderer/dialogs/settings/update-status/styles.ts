import styled from 'styled-components';

import {Button, Spinner as SpinnerBase} from '@condict/ui';

export const Main = styled.p`
  margin-top: 24px;
`;

export const MainButton = styled(Button)`
  margin-inline-end: 16px;
`;

export const SpinnerSize = 20;

export const Spinner = styled(SpinnerBase).attrs({
  size: SpinnerSize,
})`
  display: inline-block;
  margin-block: -2px;
  margin-inline: -6px 10px;
  vertical-align: -3px;
`;

export const ProgressRing = styled.svg.attrs({
  width: SpinnerSize,
  height: SpinnerSize,
})`
  /* Same alignment as the spinner above */
  margin-block: -2px;
  margin-inline: -6px 10px;
  vertical-align: -3px;

  > circle {
    transform: rotate(-90deg);
    transform-origin: center;
  }
`;
