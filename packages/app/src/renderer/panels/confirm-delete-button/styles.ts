import styled from 'styled-components';

import {Button, BodyText} from '@condict/ui';

import {ConfirmButton as ConfirmButtonBase} from '../../ui';

export const Main = styled.div`
  flex: none;
  align-self: flex-start;
  position: relative;

  > button {
    min-width: 96px;
  }
`;

export type PopupProps = {
  $visible: boolean;
};

export const Popup = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
})<PopupProps>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 14px;
  gap: 8px;

  position: absolute;
  top: ${p => p.$visible ? 'calc(100% + 2px)' : 'calc(100% - 6px)'};
  right: 0;
  width: 304px;
  z-index: 10;

  border-radius: 7px;
  border: 2px solid var(--border);
  background-color: var(--bg);
  box-shadow: var(--shadow-elevation-3);
  opacity: ${p => p.$visible ? '1' : '0'};

  transition-property: opacity, top;
  transition-duration: ${p => p.theme.timing.short}ms;
  transition-timing-function: ease;

  &:focus {
    outline: none;
  }

  > button {
    align-self: flex-start;
  }
`;

export const ErrorMessage = styled(BodyText)`
  color: var(--fg-danger);
`;

export const ConfirmButton = styled(ConfirmButtonBase).attrs({
  intent: 'danger',
})`
  align-self: flex-start;
  min-width: 176px;
`;

export const CloseButton = styled(Button)`
  min-width: 96px;
`;
