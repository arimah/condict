import styled from 'styled-components';

import BaseEditor from '../base-editor';

export type EditorProps = {
  $linkDialogOpen: boolean;
};

export const Editor = styled(BaseEditor)<EditorProps>`
  ${p => p.$linkDialogOpen && 'z-index: 1;'}
`;

export const Popup = styled.form`
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
