import styled, {css} from 'styled-components';

import {Spinner} from '@condict/ui';

export const TabList = styled.div.attrs({
  role: 'tablist',
  'aria-orientation': 'vertical',
})`
  flex: 1 1 auto;
  margin-block: 8px;
  margin-inline-end: -16px;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 10px;
    background-color: ${p => p.theme.sidebar.bg};
  }

  &::-webkit-scrollbar-thumb {
    border: 2px solid ${p => p.theme.sidebar.bg};
    border-radius: 5px;
    background-color: ${p => p.theme.sidebar.activeBg};
  }
`;

export const TabSpinner = styled(Spinner).attrs({
  size: 20,
})`
  margin-block: -2px;
  margin-inline: -2px 10px;
  flex: none;

  & + .mdi-icon {
    display: none;
  }
`;

export type TabProps = {
  isCurrent?: boolean;
  isChild?: boolean;
};

export const Tab = styled.div.attrs({
  role: 'tab',
})<TabProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-block: 8px;
  padding-inline: 16px 4px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  border-start-start-radius: 7px;
  border-end-start-radius: 7px;

  ${p => p.isChild && `margin-inline-start: 16px;`}

  ${p => p.isCurrent ? css`
    background-color: ${p => p.theme.defaultBg};
    color: ${p => p.theme.defaultFg};
  ` : css`
    background-color: ${p => p.theme.sidebar.bg};
    color: ${p => p.theme.sidebar.fg};

    &:hover {
      background-color: ${p => p.theme.sidebar.hoverBg};
    }
  `}

  &:focus {
    outline: none;
  }

  &:focus::before {
    content: '';
    position: absolute;
    inset-block: 2px;
    inset-inline: 2px 0;
    border: 2px solid ${p => p.theme.focus.color};
    border-start-start-radius: 6px;
    border-end-start-radius: 6px;
    pointer-events: none;
  }

  &:not(:first-child) {
    margin-top: 4px;
  }

  &:not(:last-child) {
    margin-bottom: 4px;
  }

  > .mdi-icon {
    margin-block: -4px;
    margin-inline: -4px 8px;
    flex: none;
  }
`;

export const TabTitle = styled.span`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Normally you shouldn't use a non-interactive element like <div> as a button,
// but in this case, I really do not want it to be focusable in any way, and it
// seems to be impossible to accomplish with plain HTML/CSS.

export type CloseButtonProps = {
  isCurrentTab?: boolean;
};

export const CloseButton = styled.div.attrs({
  role: 'button',
})<CloseButtonProps>`
  margin-block: -4px;
  margin-inline-start: 4px;
  padding: 4px;
  width: 16px;
  height: 16px;
  border-radius: 12px;
  opacity: 0.5;

  > svg {
    display: block;
  }

  > .dirty-icon + .close-icon {
    display: none;
  }

  ${Tab}:hover > & {
    opacity: 0.75;
  }

  &&:hover {
    opacity: 1;

    > .dirty-icon {
      display: none;
    }

    > .dirty-icon + .close-icon {
      display: block;
    }
  }

  &&:hover:active {
    background-color: ${p => p.isCurrentTab
      ? p.theme.defaultActiveBg
      // bg instead of activeBg since the tab is hoverBg
      : p.theme.sidebar.bg
    };
  }
`;
