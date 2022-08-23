import styled from 'styled-components';

import {CardGrid, NakedButton, Link} from '../../ui';

export const SubmitError = styled.p`
  color: ${p => p.theme.danger.defaultFg};
`;

export const TableCardList = styled(CardGrid).attrs({
  role: 'group',
})`
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

export const TableCard = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  border-radius: 7px;
  box-shadow: ${p => p.theme.shadow.elevation1};
`;

export const TableButton = styled(NakedButton)`
  flex: 1 1 auto;
  text-align: start;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  cursor: pointer;
`;

export const TableLink = styled(Link)`
  flex: none;
  padding: 2px 14px;

  border: 2px solid ${p => p.theme.defaultBg};
  background-color: ${p => p.theme.defaultBg};

  && {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    border-start-end-radius: 7px;
    border-end-end-radius: 7px;
  }

  &:hover {
    border-color: ${p => p.theme.defaultHoverBg};
    background-color: ${p => p.theme.defaultHoverBg};
  }

  &:active {
    border-color: ${p => p.theme.defaultActiveBg};
    background-color: ${p => p.theme.defaultActiveBg};
  }

  &:focus,
  &:focus-visible {
    border-color: ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  > .mdi-icon {
    display: block;
  }
`;

export const InflectedFormList = styled.ul`
  margin-bottom: 16px;
  padding-inline: 0;
  list-style-type: none;

  > li {
    display: flex;
    margin-block: 8px 12px;
    flex-direction: row;
    gap: 4px;
    align-items: flex-end;
  }
`;

export const InflectedFormLabel = styled.div`
  display: flex;
  gap: 16px;

  > label {
    flex: none;
    font-weight: bold;
  }

  > span {
    flex: 1 1 auto;
    font-style: italic;
    text-align: right;
  }
`;

export const InflectedFormInput = styled.div`
  flex: 1 1 auto;

  > input {
    display: block;
    margin-top: 2px;
    width: 100%;
  }
`;

export type InflectedFormActionProps = {
  hasCustomName: boolean;
};

export const InflectedFormAction = styled(NakedButton)<InflectedFormActionProps>`
  display: block;
  flex: none;
  margin-block: -3px;
  padding: 1px;
  color: ${p => p.hasCustomName && p.theme.accent.defaultFg};

  &:focus {
    padding: 1px;
  }

  > .mdi-icon.mdi-icon {
    display: block;
    margin: 0;
  }
`;
