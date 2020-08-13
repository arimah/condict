import styled, {createGlobalStyle} from 'styled-components';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${p => p.theme.general[
      p.theme.dark ? 'hoverBg' : 'activeBg'
    ]};
    color: ${p => p.theme.general.fg};
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 900px;
  }
`;
