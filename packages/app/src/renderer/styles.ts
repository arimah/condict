import {createGlobalStyle} from 'styled-components';

export const AppStyles = createGlobalStyle`
  html,
  body,
  #root {
    width: 100%;
    height: 100%;
  }

  body {
    background-color: var(--bg);
    color: var(--fg);
    /* Pretend we're a real app. */
    user-select: none;
  }

  #root {
    display: grid;
    justify-items: stretch;
    align-items: stretch;
  }

  a:focus {
    outline: none;
  }

  a:focus-visible {
    box-shadow: 0 0 0 1px var(--bg), 0 0 0 4px var(--focus-border);
    border-radius: 1px;
  }
`;
