import styled, {createGlobalStyle} from 'styled-components';

import {TextInput, transition} from '@condict/ui';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${p => p.theme.general[
      p.theme.dark ? 'hoverBg' : 'activeBg'
    ]};
    color: ${p => p.theme.general.fg};

    ${transition('color, background-color')}
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 900px;
  }
`;

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
