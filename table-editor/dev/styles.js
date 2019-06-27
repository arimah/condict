import styled, {createGlobalStyle} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {TextInput, transition} from '@condict/ui';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${ifProp(theme('dark'),
      theme('general.hoverBg'),
      theme('general.activeBg')
    )};
    color: ${theme('general.fg')};

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
  background-color: ${theme('general.bg')};
`;

export const ToolbarWrapper = styled.div`
  margin-bottom: 16px;
`;

export const TermInput = styled(TextInput)`
  width: 400px;
`;
