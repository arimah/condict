import styled from 'styled-components';

import {Spinner} from '@condict/ui';

export type LoadingScreenProps = {
  visible: boolean;
};

export const LoadingScreen = styled.main<LoadingScreenProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  justify-self: center;
  font-size: 24px;
  line-height: 36px;
  opacity: ${p => p.visible ? '1' : '0'};

  transition: opacity ${p => 2 * p.theme.timing.long}ms ease-out;
`;

export const LoadingSpinner = styled(Spinner)`
  color: ${p => p.theme.accent.defaultFg};
`;

export const LoadingText = styled.div`
  margin-top: 8px;
`;
