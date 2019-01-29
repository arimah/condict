import styled, {createGlobalStyle} from 'styled-components';
import {theme} from 'styled-tools';

import {Button, TextInput} from '@condict/admin-ui';

export const AppStyles = createGlobalStyle`
  body {
    font-size: 11pt;
    font-family: 'Inter UI', sans-serif;
    background-color: ${theme('general.activeBg')};
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
    margin-top: 10px;
    margin-bottom: 20px;
    font-size: 2rem;
  }

  h2 {
    margin-top: 40px;
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  h3 {
    margin-top: 30px;
    margin-bottom: 10px;
    font-size: 1.25rem;
  }

  p {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`;

export const EditorContainer = styled.div`
  padding: 20px;
  border-radius: 7px;
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
