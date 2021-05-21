import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-size: 14px;
    line-height: 16px;
    font-family: 'Inter', sans-serif;
    font-feature-settings:
      'cv07', /* alternative ß */
      'cv08', /* upper-case i with serifs */
      'tnum', /* tabular numerals */
      'calt' off, /* contextual alternatives */
      'liga' off; /* standard ligatures */
  }

  h1 {
    margin-top: 8px;
    margin-bottom: 24px;
    font-size: 28px;
    line-height: 32px;
    font-weight: bold;
  }

  h2 {
    margin-top: 30px;
    margin-bottom: 8px;
    font-size: 24px;
    line-height: 28px;
    font-weight: bold;
  }

  h3 {
    margin-top: 26px;
    margin-bottom: 8px;
    font-size: 21px;
    line-height: 24px;
    font-weight: bold;
  }

  h4 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 18px;
    line-height: 21px;
    font-weight: bold;
  }

  h5 {
    margin-top: 22px;
    margin-bottom: 8px;
    font-size: 17px;
    line-height: 19px;
    font-weight: bold;
  }

  h6 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 15px;
    line-height: 17px;
    font-weight: bold;
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
`;
