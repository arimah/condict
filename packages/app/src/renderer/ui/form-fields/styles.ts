import styled, {css} from 'styled-components';

import {Button, TextInput as TextInputBase} from '@condict/ui';
import {
  DescriptionEditor as DescriptionEditorBase,
} from '@condict/rich-text-editor';

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
  color: ${p => p.theme.danger.defaultFg};
`;

export type TextInputProps = {
  $touched: boolean;
  $invalid: boolean;
};

export const TextInput = styled(TextInputBase)<TextInputProps>`
  ${p => p.$touched && css<TextInputProps>`
    ${p => p.$invalid && css`&:not(:focus):not(.force-focus) {
      border-color: ${p => p.theme.danger.boldBg};
    }`}

    &:invalid:not(:focus):not(.force-focus) {
      border-color: ${p => p.theme.danger.boldBg};
    }
  `}
`;

export const DescriptionEditor = styled(DescriptionEditorBase)`
  margin-block: 0;
`;

export const FormButtons = styled.div`
  display: flex;
  flex-direction: row;
  margin: -8px -16px -16px;
  padding: 24px 16px;
  align-items: center;
  gap: 8px;
  position: sticky;
  bottom: 0;
  background-color: ${p => p.theme.defaultBg};
`;

export const SubmitButton = styled(Button).attrs({
  bold: true,
  intent: 'accent',
  type: 'submit',
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
  color: ${p => p.theme.danger.defaultFg};
`;
