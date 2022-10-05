import styled from 'styled-components';

import {Button} from '@condict/ui';

import PopupBase from '../popup';

export const Popup = styled(PopupBase)`
  max-width: 480px;

  animation-name: enter;
  animation-duration: ${p => p.theme.timing.short}ms;
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
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SecondaryLabel = styled.span`
  flex: none;
  padding-block: 0;
  padding-inline: 8px 0;
  white-space: nowrap;
  opacity: 0.7;
`;

export const Actions = styled.span`
  flex: none;
  padding-block: 2px;
  padding-inline: 0 2px;
`;

export const Action = styled(Button)`
  display: flex;
  padding: 3px 8px;
  min-height: max(28px, var(--line-height-md) + 10px);
  border-radius: 5px;

  > .mdi-icon {
    &:first-child {
      margin-inline-start: -4px;
    }

    &:not(:first-child) {
      margin-inline-start: 6px;
    }

    &:last-child {
      margin-inline-end: -4px;
    }

    &:not(:last-child) {
      margin-inline-end: 6px;
    }
  }
`;

export const PrimaryAction = styled(Action)`
  margin: 2px;
  flex: 1 1 auto;
  flex-direction: row;
  overflow: hidden;
  justify-content: flex-start;
`;
