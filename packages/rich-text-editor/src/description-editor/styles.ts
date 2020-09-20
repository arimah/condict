import styled from 'styled-components';

import BaseEditor from '../base-editor';

export type EditorProps = {
  $dialogOpen: boolean;
};

export const Editor = styled(BaseEditor)<EditorProps>`
  ${p => p.$dialogOpen && 'z-index: 1;'}
`;

export const Popup = styled.form.attrs({
  role: 'dialog',
  tabIndex: -1,
})`
  box-sizing: border-box;
  overflow: hidden;
  position: absolute;
  z-index: 5;
  border-radius: 7px;
  border: 2px solid ${p => p.theme.general.borderColor};
  background-color: ${p => p.theme.general.altBg};
  color: ${p => p.theme.general.altFg};
  box-shadow: ${p => p.theme.shadow.elevation2};

  &:focus {
    outline: none;
  }
`;
