import styled from 'styled-components';

import {Button} from '@condict/ui';

import PopupBase from '../popup';

const Width = 340;

export const Popup = styled(PopupBase).attrs({
  width: Width,
})`
  animation-name: enter;
  animation-duration: 100ms;
  animation-iteration-count: 1;
  animation-timing-function: linear;

  @keyframes enter {
    from { opacity: 0; }
    to { opactiy: 1 }
  }
`;

export const Columns = styled.div`
  display: flex;
  flex-direction: row;
`;

export const PrimaryLabel = styled.span`
  flex: 1 1 auto;
  padding: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SecondaryLabel = styled.span`
  flex: none;
  padding: 8px 8px 8px 0;
  white-space: nowrap;
  opacity: 0.7;
`;

export const Actions = styled.span`
  flex: none;
  padding: 2px 2px 2px 0;
`;

export const Action = styled(Button).attrs({
  intent: 'secondary',
})`
  padding: 4px 8px;
  border-radius: 5px;
  border-color: ${p => p.theme.general.altBg};
  background-color: ${p => p.theme.general.altBg};

  &:hover:not(:focus):not(.force-focus) {
    border-color: ${p => p.theme.general.hoverAltBg};
    background-color: ${p => p.theme.general.hoverAltBg};
  }

  &:active:not(:focus):not(.force-focus) {
    border-color: ${p => p.theme.general.activeAltBg};
    background-color: ${p => p.theme.general.activeAltBg};
  }
`;

export const PrimaryAction = styled(Action)`
  display: flex;
  margin: 2px;
  padding: 4px;
  flex: 1 1 auto;
  flex-direction: row;
  overflow: hidden;
  align-items: center;
  text-align: left;

  > .mdi-icon {
    flex: none;

    &:first-child {
      margin-left: -2px;
    }

    &:not(:first-child) {
      margin-left: 6px;
    }

    &:last-child {
      margin-right: -2px;
    }

    &:not(:last-child) {
      margin-right: 6px;
    }
  }

  > ${PrimaryLabel} {
    padding: 0;
  }

  > ${SecondaryLabel} {
    padding: 0 0 0 8px;
  }
`;
