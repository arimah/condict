import styled from 'styled-components';

import {Button} from '@condict/ui';

import PopupBase from '../popup';

export const Popup = styled(PopupBase)`
  max-width: 480px;

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
  padding-block: 8px;
  padding-inline: 0 8px;
  white-space: nowrap;
  opacity: 0.7;
`;

export const Actions = styled.span`
  flex: none;
  padding-block: 2px;
  padding-inline: 0 2px;
`;

export const Action = styled(Button).attrs({
  borderless: true,
})`
  padding: 4px 8px;
  border-radius: 5px;
`;

export const PrimaryAction = styled(Action)`
  display: flex;
  margin: 2px;
  padding: 4px;
  flex: 1 1 auto;
  flex-direction: row;
  overflow: hidden;
  align-items: center;
  text-align: start;

  > .mdi-icon {
    flex: none;

    &:first-child {
      margin-inline-start: -2px;
    }

    &:not(:first-child) {
      margin-inline-start: 6px;
    }

    &:last-child {
      margin-inline-end: -2px;
    }

    &:not(:last-child) {
      margin-inline-end: 6px;
    }
  }

  > ${PrimaryLabel} {
    padding: 0;
  }

  > ${SecondaryLabel} {
    padding-block: 0;
    padding-inline: 8px 0;
  }
`;
