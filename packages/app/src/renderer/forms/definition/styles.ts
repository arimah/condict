import styled from 'styled-components';

import {Checkbox, TextInput, Toolbar} from '@condict/ui';

import {NakedButton} from '../../ui';

export const TableItemGap = 16;

export const TableList = styled.ul`
  margin-block: 0;
  padding-block: 8px;
  list-style-type: none;

  &:empty {
    padding-top: 0;
  }
`;

export const TableItem = styled.li<{
  $moving?: boolean;
  $held?: boolean;
}>`
  margin-block: 0 ${TableItemGap}px;
  padding-inline: 16px;
  padding-bottom: 16px;
  position: relative;
  top: 0;
  border-radius: 5px;
  background-color: var(--bg-alt);
  box-shadow: ${p => p.$held && 'var(--shadow-elevation-2)'};

  transition:
    ${p => p.$moving
      ? `top ${Math.max(1, p.theme.timing.long)}ms ease,`
      : ''
    }
    box-shadow ${p => p.theme.timing.short}ms ease-in-out;

  &:last-child {
    margin-bottom: 8px;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;

export const TableToolbar = styled(Toolbar)`
  margin-inline: -16px;
  padding-inline-start: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

export const DragHandle = styled.div`
  display: flex;
  flex: 1 1 auto;
  margin-block: -2px;
  padding: 4px 2px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  > .mdi-icon {
    display: block;
    flex: none;
    opacity: 0.5;
  }
`;

export const TableStatus = styled.div<{
  $error: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-block: 16px;
  color: ${p => p.$error && 'var(--fg-danger)'};

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
  padding-block: 8px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  row-gap: 8px;

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

export const StemValue = styled(TextInput)<{
  $usesTerm: boolean;
}>`
  margin-inline-end: 4px;
  font-style: ${p => p.$usesTerm && 'italic'};
  color: ${p => !p.$usesTerm && 'var(--fg-accent)'};
`;

export const StemStatus = styled.span`
  flex: none;
`;

export const StemAction = styled(NakedButton)<{
  $usesTerm: boolean;
}>`
  display: block;
  margin-block: -4px;
  padding: 1px 2px;
  ${p => !p.$usesTerm && `
    --button-fg: var(--fg-accent);
  `};

  &:focus {
    padding: 1px 2px;
  }

  > .mdi-icon.mdi-icon {
    display: block;
    margin: 0;
  }
`;

export const BooleanFieldInput = styled(Checkbox)`
  align-self: start;
  font-weight: bold;
`;

export const CustomFieldsHeading = styled.div`
  margin-block: 24px 2px;
`;

export const CustomFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding-block: 14px 18px;
  padding-inline-start: 24px;
  gap: 16px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    inset-inline-start: 6px;
    width: 28px;
    border-inline-start: 2px solid var(--border);
    border-bottom: 2px solid var(--border);
    border-end-start-radius: 5px;
    pointer-events: none;
  }

  > :nth-child(n) {
    flex: none;
    margin-block: 0;
  }
`;
