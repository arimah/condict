import styled from 'styled-components';

import {
  Button,
  TextInput as TextInputBase,
  Select as SelectBase,
  Toolbar,
} from '@condict/ui';
import {
  DescriptionEditor as DescriptionEditorBase,
  TableCaptionEditor as TableCaptionEditorBase,
} from '@condict/rich-text-editor';
import {
  InflectionTableEditor as InflectionTableEditorBase,
  DefinitionTableEditor as DefinitionTableEditorBase,
} from '@condict/table-editor';

import {ConfirmButton} from '../ui';

export const Field = styled.div`
  display: flex;
  margin-block: 16px;
  flex-direction: column;
`;

export const Label = styled.label`
  flex: none;
  margin-bottom: 2px;
  align-self: flex-start;
  font-weight: bold;
`;

export const ErrorMessage = styled.p`
  margin-block: 4px 0;
  color: var(--fg-danger);
`;

export const TextInput = styled(TextInputBase)<{
  $invalid: boolean;
}>`
  ${p => p.$invalid && `
    &:not(:focus):not(.force-focus) {
      border-color: var(--border-danger);
    }
  `}

  &:invalid:not(:focus):not(.force-focus) {
    border-color: var(--border-danger);
  }
`;

export const SelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 8px;

  > button {
    flex: none;
  }
`;

export const Select = styled(SelectBase<any>)<{
  $invalid: boolean;
}>`
  flex: 0 1 auto;

  > select {
    ${p => p.$invalid && `
      &:not(:focus):not(.force-focus) {
        border-color: var(--border-danger);
      }
    `}

    &:invalid:not(:focus):not(.force-focus) {
      border-color: var(--border-danger);
    }
  }
`;

export const DescriptionEditor = styled(DescriptionEditorBase)`
  margin-block: 0;
`;

export const TableCaptionEditor = styled(TableCaptionEditorBase)`
  margin-block: 0;
`;

export const TableBorder = styled.div`
  border: 2px solid var(--input-border);
  border-radius: 5px;
`;

export const TableToolbar = styled(Toolbar)`
  border-radius: 3px 3px 0 0;
`;

export const TableContainer = styled.div`
  display: flex;
  overflow-x: auto;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
`;

export const InflectionTableEditor = styled(InflectionTableEditorBase)`
  border: 6px solid transparent;
`;

export const DefinitionTableContainer = styled(TableContainer)`
  margin: -4px;
`;

export const DefinitionTableEditor = styled(DefinitionTableEditorBase)`
  border: 4px solid transparent;
`;

export const FormButtons = styled.div<{
  $stuck: boolean;
}>`
  display: flex;
  flex-direction: row;
  margin: -8px -16px -17px;
  padding: 24px 16px 25px;
  align-items: center;
  gap: 8px;
  position: sticky;
  bottom: -1px;
  z-index: 5;
  background-color: var(--bg);
  box-shadow: ${p => p.$stuck && `0 -8px 4px -6px var(--shadow-color)`};
  transition: box-shadow ${p => p.theme.timing.short}ms linear;
`;

export const SubmitButton = styled(Button).attrs({
  intent: 'accent',
  type: 'submit',
})`
  flex: none;
  align-self: flex-end;
  min-width: 128px;
`;

export const DeleteButton = styled(ConfirmButton).attrs({
  intent: 'danger',
})`
  flex: none;
  align-self: flex-end;
  min-width: 128px;
`;

export const CancelButton = styled(Button)`
  flex: none;
  align-self: flex-end;
  min-width: 96px;
`;

export const SubmitError = styled.span.attrs({
  role: 'alert',
})`
  flex: 1 1 auto;
  color: var(--fg-danger);
`;
