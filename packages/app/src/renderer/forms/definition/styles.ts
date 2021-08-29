import styled from 'styled-components';

import {TextInput, Toolbar} from '@condict/ui';

export const TableItemGap = 16;

export const TableList = styled.ul`
  margin-block: 0;
  margin-inline-start: 6px;
  padding-bottom: 8px;
  padding-inline-start: 16px;
  list-style-type: none;
  border-inline-start: 2px solid ${p => p.theme.general.border};
`;

export type TableItemProps = {
  moving?: boolean;
};

export const TableItem = styled.li<TableItemProps>`
  margin-block: 8px ${TableItemGap}px;
  padding-inline: 16px;
  position: relative;
  top: 0;
  border: 2px solid ${p => p.theme.general.border};
  border-radius: 3px;
  background-color: ${p => p.theme.defaultBg};

  transition: ${p =>
    p.moving && `top ${Math.max(1, p.theme.timing.long)}ms ease`
  };

  &:last-child {
    margin-bottom: 8px;
  }
`;

export const TableToolbar = styled(Toolbar)`
  margin-inline: -16px;
  padding-inline-start: 16px;
  border-bottom: 2px solid ${p => p.theme.general.border};
  border-radius: 1px 0 0 1px;
`;

export type TableStatusProps = {
  error: boolean;
};

export const TableStatus = styled.div<TableStatusProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-block: 16px;
  color: ${p => p.error &&  p.theme.danger.defaultFg};

  > .mdi-icon,
  > button {
    flex: none;
  }

  > span {
    flex: 0 1 auto;
  }
`;

export const TableName = styled.span`
  flex: 1 1 auto;
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
`;

export const StemsList = styled.div`
  display: grid;
  margin-inline-start: 6px;
  padding-block: 8px;
  padding-inline-start: 16px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  row-gap: 8px;
  border-inline-start: 2px solid ${p => p.theme.general.border};

  &:empty {
    padding-bottom: 0;
  }
`;

export const StemName = styled.label`
  padding-inline-end: 8px;
  max-width: 240px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: bold;
`;

export type StemValueProps = {
  usesTerm: boolean;
};

export const StemValue = styled(TextInput)<StemValueProps>`
  margin-inline-end: 8px;
  font-style: ${p => p.usesTerm && 'italic'};
`;

export const ListTools = styled.div`
  padding-inline-start: 24px;
  position: relative;

  &::before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 6px;
    width: 14px;
    height: calc(50% + 1px);
    border-inline-start: 2px solid ${p => p.theme.general.border};
    border-bottom: 2px solid ${p => p.theme.general.border};
    border-end-start-radius: 5px;
  }
`;
