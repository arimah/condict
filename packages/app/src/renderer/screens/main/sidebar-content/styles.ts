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

export const SearchButton = styled(FlexButton)`
  border-color: ${p => p.theme.defaultBg};
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  &:hover {
    border-color: ${p => p.theme.defaultHoverBg};
    background-color: ${p => p.theme.defaultHoverBg};
  }

  &:active {
    border-color: ${p => p.theme.defaultActiveBg};
    background-color: ${p => p.theme.defaultActiveBg};
  }

  &:focus {
    border-color: ${p => p.theme.focus.color};
    box-shadow:
      inset 0 0 0 1px ${p => p.theme.sidebar.bg},
      ${p => p.theme.focus.shadow};
  }
`;

export const Button = styled(FlexButton)`
  border-color: ${p => p.theme.sidebar.bg};
  background-color: ${p => p.theme.sidebar.bg};
  color: ${p => p.theme.sidebar.fg};

  &:hover {
    border-color: ${p => p.theme.sidebar.hoverBg};
    background-color: ${p => p.theme.sidebar.hoverBg};
  }

  &:active {
    border-color: ${p => p.theme.sidebar.activeBg};
    background-color: ${p => p.theme.sidebar.activeBg};
  }

  &:focus {
    border-color: ${p => p.theme.focus.color};
    box-shadow:
      inset 0 0 0 1px ${p => p.theme.sidebar.bg},
      ${p => p.theme.focus.shadow};
  }
`;
