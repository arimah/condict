import styled from 'styled-components';

import {Spinner as SpinnerBase} from '@condict/ui';

export const Main = styled.p`
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 16px;
  margin-top: 24px;

  > button {
    flex: none;
  }

  > span {
    flex: 1 1 auto;
  }
`;

export const SpinnerSize = 20;

export const Spinner = styled(SpinnerBase).attrs({
  size: SpinnerSize,
})`
  margin-block: -2px;
  margin-inline: -6px 10px;
`;

export const ProgressRing = styled.svg.attrs({
  width: SpinnerSize,
  height: SpinnerSize,
})`
  /* Same alignment as the spinner above */
  margin-block: -2px;
  margin-inline: -6px 10px;

  > circle {
    transform: rotate(-90deg);
    transform-origin: center;
  }
`;
