import styled from 'styled-components';

import {Button as ButtonBase} from '@condict/ui';

const FlexButton = styled(ButtonBase)`
  flex: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: start;

  /* slightly more space before the icon */
  > .mdi-icon:first-child {
    flex: none;
    margin-inline-start: -4px;
  }
`;

// These buttons are never disabled, so no need to style them for that

export const SearchButton = styled(FlexButton)`
  --button-fg: var(--button-naked-fg);
  --button-bg: var(--button-naked-bg);
  --button-bg-hover: var(--button-naked-bg-hover);
  --button-bg-pressed: var(--button-naked-bg-pressed);
  --button-border: var(--button-naked-border);
  --button-border-hover: var(--button-naked-border-hover);
  --button-border-pressed: var(--button-naked-border-pressed);
`;

export const Button = styled(FlexButton)`
  --bg: var(--sidebar-bg);
  --button-fg: var(--sidebar-fg);
  --button-bg: var(--sidebar-bg);
  --button-bg-hover: var(--sidebar-bg-hover);
  --button-bg-pressed: var(--sidebar-bg-pressed);
  --button-border: var(--button-bg);
  --button-border-hover: var(--button-bg-hover);
  --button-border-pressed: var(--button-bg-pressed);
`;
