import styled, {createGlobalStyle} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

export const AppStyles = createGlobalStyle`
  body {
    font-size: 11pt;
    font-family: 'Inter', sans-serif;
    font-feature-settings: 'cv08', 'calt' off;
    background-color: ${ifProp(theme('dark'),
      theme('general.hoverBg'),
      theme('general.activeBg')
    )};
    color: ${theme('general.fg')};

    transition-property: color, background-color;
    transition-timing-function: linear;
    transition-duration: ${theme('timing.short')};
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 900px;
  }

  h1 {
    margin-top: 8px;
    margin-bottom: 24px;
    font-size: 2rem;
  }

  h2 {
    margin-top: 38px;
    margin-bottom: 16px;
    font-size: 1.5rem;
  }

  h3 {
    margin-top: 32px;
    margin-bottom: 8px;
    font-size: 1.25rem;
  }

  p {
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;

export const Group = styled.p`
  & > :not(:last-child) {
    margin-right: 16px;
  }
`;
