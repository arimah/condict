import styled from 'styled-components';

import {Button, Checkbox} from '@condict/ui';

import {TextField} from '../../form-fields';

export const PartOfSpeechList = styled.div`
  display: flex;
  flex-direction: column;
  padding-block: 8px 16px;
  gap: 8px;
`;

export const PartOfSpeechOption = styled(Checkbox)<{
  $implicitlyChecked?: boolean;
}>`
  align-self: start;
  ${p => p.$implicitlyChecked && `
    --checkbox-bg-checked: var(--checkbox-border);
    --checkbox-border-checked: var(--checkbox-border);
  `}
`;

export const ListValues = styled.div`
  display: grid;
  margin-block: 0;
  padding-block: 8px;
  list-style-type: none;
  grid-template-rows: auto;
  grid-auto-rows: auto;
  grid-template-columns: 3fr 2fr auto;
  row-gap: 8px;
  column-gap: 4px;
  align-items: start;
  justify-items: stretch;
  max-width: 45rem;

  &:empty {
    padding-bottom: 0;
  }
`;

export const ListValueLabel = styled.span`
  font-weight: bold;
`;

export const ListValueTextField = styled(TextField)`
  margin-block: 0;
`;

export const ListValueDeleteButton = styled(Button).attrs({
  intent: 'naked',
})`
  margin-block: -4px;
  padding: 1px 2px;

  &:focus {
    padding: 1px 2px;
  }

  > .mdi-icon.mdi-icon {
    display: block;
    margin: 0;
  }
`;

export const ListValueActions = styled.div`
  padding-bottom: 16px;

  > :not(:last-child) {
    margin-inline-end: 8px;
  }
`;
