import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'AppleSymbols';
    src: local('SF Pro'), local('SFPro'), local('SFPro-Regular');
    unicode-range: U+2325, U+21E7, U+2318, U+2303;
  }

  * {
    margin: 0;
    padding: 0;
  }

  html {
    ${p => Object.entries(p.theme.vars).map(([name, value]) =>
      value != null
        ? `--${name}: ${value};`
        : null
    )}

    font-size: var(--font-size-md);
    line-height: var(--line-height-md);
    font-family: 'AppleSymbols', 'Noto Sans', sans-serif;
  }

  h1 {
    margin-block: 8px 24px;
    font-size: var(--font-size-huge);
    line-height: var(--line-height-huge);
    font-weight: bold;
  }

  h2 {
    margin-block: 28px 8px;
    font-size: var(--font-size-xxxl);
    line-height: var(--line-height-xxxl);
    font-weight: bold;
  }

  h3 {
    margin-block: 22px 8px;
    font-size: var(--font-size-xxl);
    line-height: var(--line-height-xxl);
    font-weight: 600;
  }

  h4 {
    margin-block: 18px 8px;
    font-size: var(--font-size-lg);
    line-height: var(--font-size-lg);
    font-weight: 600;
  }

  h1,
  h2 {
    strong, b {
      font-weight: 900;
    }
  }

  h3,
  h4 {
    strong, b {
      font-weight: 800;
    }
  }

  p {
    margin-block: 8px;
  }

  ul, ol {
    margin-block: 8px;
    padding-inline-start: 32px;
  }

  li {
    margin-block: 4px;
  }

  a:link {
    color: var(--link-fg);
    text-decoration: none;
  }

  a:visited {
    color: var(--link-fg-visited);
    text-decoration: none;
  }

  a:hover {
    color: var(--link-fg-hover);
    text-decoration: none;
  }

  a:active {
    color: var(--link-fg-pressed);
    text-decoration: none;
  }

  html[dir=rtl] .mdi-icon.rtl-mirror {
    transform: scale(-1, 1);
  }
`;
