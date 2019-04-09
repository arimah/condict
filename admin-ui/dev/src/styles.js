import styled, {createGlobalStyle} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

export const AppStyles = createGlobalStyle`
  body {
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
`;

export const Group = styled.p`
  & > :not(:last-child) {
    margin-right: 16px;
  }
`;
