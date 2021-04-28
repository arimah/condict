import styled from 'styled-components';

import {TextInput, Button, Shortcut} from '@condict/ui';

import Popup from './popup';

export const CloseKey = Shortcut.parse('Escape');

export const PrevResultKey = Shortcut.parse('ArrowUp');

export const NextResultKey = Shortcut.parse('ArrowDown');

const Dialog = styled(Popup).attrs({
  trapFocus: true,
  restoreFocus: true,
})`
  width: 376px;
`;

export default Dialog;

export const SearchWrapper = styled.div.attrs({
  role: 'combobox',
})`
  display: flex;
  margin: 2px;
  flex-direction: row;

  border-radius: 3px;
  border: 2px solid ${p => p.theme.general.bg};
  background-color: ${p => p.theme.general.bg};
`;

export const SearchInput = styled(TextInput).attrs({
  size: 1,
  minimal: true,
})`
  flex: 1 1 auto;
  padding: 4px;
  min-width: 100px;
  border-radius: 3px 0 0 3px;

  &:focus {
    padding: 4px;
    border: none;
    box-shadow: none;
  }
`;

export const SubmitButton = styled(Button).attrs({
  intent: 'primary',
  bold: true,
  slim: true,
  type: 'submit',
})`
  padding: 1px 12px;
  flex: none;
  border-radius: 3px;
`;
