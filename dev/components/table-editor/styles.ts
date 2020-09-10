import styled from 'styled-components';

import {TextInput} from '@condict/ui';

export const EditorContainer = styled.div`
  padding: 24px;
  border-radius: 8px;
  background-color: ${p => p.theme.general.bg};
`;

export const ToolbarWrapper = styled.div`
  margin-bottom: 16px;
`;

export const TermInput = styled(TextInput)`
  width: 400px;
`;
