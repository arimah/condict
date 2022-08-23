import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-size: 14px;
    line-height: 16px;
    font-family: 'Noto Sans', sans-serif;
  }

  h1 {
    margin-block: 8px 24px;
    font-size: 28px;
    line-height: 32px;
    font-weight: bold;
  }

  h2 {
    margin-block: 28px 8px;
    font-size: 24px;
    line-height: 26px;
    font-weight: bold;
  }

  h3 {
    margin-block: 22px 8px;
    font-size: 20px;
    line-height: 22px;
    font-weight: 600;
  }

  h4 {
    margin-block: 18px 8px;
    font-size: 16px;
    line-height: 18px;
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
    color: ${p => p.theme.link.link};
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

  html[dir=rtl] .mdi-icon.rtl-mirror {
    transform: scale(-1, 1);
  }
`;
