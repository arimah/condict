import styled, {createGlobalStyle} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {Button, TextInput} from '@condict/admin-ui';

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

export const EditorContainer = styled.div`
  padding: 24px;
  border-radius: 8px;
  background-color: ${theme('general.bg')};
`;

export const Group = styled.div`
  margin-bottom: 16px;

  & > :not(:first-child) {
    margin-left: 1px;
  }

  & > :not(:last-child) {
    margin-right: 1px;
  }
`;

export const Separator = styled.span`
  display: inline-block;
  height: 27px;
  vertical-align: -8px;
  border-left: 2px solid ${theme('general.borderColor')};

  &:not(:first-child) {
    margin-left: 8px;
  }

  &:not(:last-child) {
    margin-right: 8px;
  }
`;

export const IconButton = styled(Button)`
  > svg {
    vertical-align: bottom;
  }
`;

export const TermInput = styled(TextInput)`
  width: 400px;
`;
