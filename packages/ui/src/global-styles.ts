import {createGlobalStyle} from 'styled-components';

import LightTheme from './theme/light';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-size: 11pt;
    font-family: 'Inter', sans-serif;
    font-feature-settings: 'cv08', 'tnum', 'calt' off;
  }

  h1 {
    margin-top: 8px;
    margin-bottom: 24px;
    font-size: 2rem;
    font-weight: bold;
  }

  h2 {
    margin-top: 38px;
    margin-bottom: 16px;
    font-size: 1.5rem;
    font-weight: bold;
  }

  h3 {
    margin-top: 32px;
    margin-bottom: 8px;
    font-size: 1.25rem;
    font-weight: bold;
  }

  h4 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 1.175em;
    font-weight: bold;
  }

  h5 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 1.1em;
    font-weight: bold;
  }

  h6 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 0.9em;
    font-weight: bold;
    text-transform: uppercase;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    strong, b {
      font-weight: 900;
    }
  }

  p {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  ul, ol {
    margin-top: 8px;
    margin-bottom: 8px;
    padding-left: 32px;
  }

  li {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  a:link {
    color: ${p => p.theme.link.color};
    text-decoration: none;
  }

  a:visited {
    color: ${p => p.theme.link.visited};
    text-decoration: none;
  }

  a:hover {
    color: ${p => p.theme.link.hover};
    text-decoration: none;
  }

  a:active {
    color: ${p => p.theme.link.active};
    text-decoration: none;
  }
`;

GlobalStyles.defaultProps = {
  theme: LightTheme,
};
