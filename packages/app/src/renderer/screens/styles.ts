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
  font-size: var(--font-size-xxxl);
  line-height: var(--line-height-xxxl);
  opacity: ${p => p.visible ? '1' : '0'};

  transition: opacity ${p => 2 * p.theme.timing.long}ms ease-out;
`;

export const LoadingSpinner = styled(Spinner)`
  color: var(--fg-accent);
`;

export const LoadingText = styled.div`
  margin-top: 8px;
`;

export const ErrorScreen = styled.main.attrs({
  tabIndex: -1,
})`
  align-self: center;
  justify-self: center;
  width: calc(100vw - 64px);
  max-width: 600px;

  &:focus {
    outline: none;
  }
`;
