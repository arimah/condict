import styled from 'styled-components';

import BaseEditor from '../base-editor';

export type EditorProps = {
  $linkDialogOpen: boolean;
};

export const Editor = styled(BaseEditor)<EditorProps>`
  ${p => p.$linkDialogOpen && 'z-index: 1;'}
`;
