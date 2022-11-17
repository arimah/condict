import styled from 'styled-components';

import {CardGrid, NakedButton, Link} from '../../ui';

export const SubmitError = styled.p`
  color: var(--fg-danger);
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
  box-shadow: var(--shadow-elevation-1);
`;

export const TableButton = styled(NakedButton)`
  flex: 1 1 auto;
  justify-content: start;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  cursor: pointer;
`;

export const TableLink = styled(Link)`
  flex: none;
  padding: 2px 14px;

  border: 2px solid var(--bg);
  background-color: var(--bg);

  && {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    border-start-end-radius: 7px;
    border-end-end-radius: 7px;
  }

  &:hover {
    border-color: var(--bg-hover);
    background-color: var(--bg-hover);
  }

  &:active {
    border-color: var(--bg-pressed);
    background-color: var(--bg-pressed);
  }

  &:is(:focus, :focus-visible) {
    border-color: var(--focus-border);
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

export const InflectedFormAction = styled(NakedButton)<{
  $hasCustomName: boolean;
}>`
  display: block;
  flex: none;
  margin-block: -3px;
  padding: 1px;

  ${p => p.$hasCustomName && `
    --button-fg: var(--fg-accent);
  `}

  &:focus {
    padding: 1px;
  }

  > .mdi-icon.mdi-icon {
    display: block;
    margin: 0;
  }
`;
