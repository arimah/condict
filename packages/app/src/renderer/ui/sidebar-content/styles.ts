import styled from 'styled-components';

import {Button as ButtonBase} from '@condict/ui';

const FlexButton = styled(ButtonBase)`
  flex: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;

  /* slightly more space to the left of the icon */
  > .mdi-icon:first-child {
    flex: none;
    margin-left: -4px;
  }
`;

export const SearchButton = styled(FlexButton)`
  border-radius: 16px;
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
  }
`;
