import {createGlobalStyle} from 'styled-components';

export const AppStyles = createGlobalStyle`
  html,
  body,
  #root {
    width: 100%;
    height: 100%;
  }

  body {
    background-color: ${p => p.theme.defaultBg};
    color: ${p => p.theme.defaultFg};
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
    box-shadow:
      0 0 0 1px ${p => p.theme.defaultBg},
      0 0 0 4px ${p => p.theme.focus.color};
    border-radius: 1px;
  }
`;
