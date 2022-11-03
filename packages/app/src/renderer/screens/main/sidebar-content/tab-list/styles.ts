import styled, {css, keyframes} from 'styled-components';

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
    background-color: var(--sidebar-bg);
  }

  &::-webkit-scrollbar-thumb {
    border: 2px solid var(--sidebar-bg);
    border-radius: 5px;
    background-color: var(--sidebar-bg-pressed);
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

const AngryShake = keyframes`
  0%   { transform: translateX(0); }
  5%   { transform: translateX(4px); }
  23%  { transform: translateX(-4px); }
  41%  { transform: translateX(4px); }
  59%  { transform: translateX(-4px); }
  77%  { transform: translateX(4px); }
  95%  { transform: translateX(-4px); }
  100% { transform: translateX(0px); }
`;

export type TabProps = {
  isCurrent?: boolean;
  isChild?: boolean;
  isCrashed?: boolean;
};

export const Tab = styled.div.attrs({
  role: 'tab',
})<TabProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-block: 7px;
  padding-inline: 16px 4px;
  min-height: 32px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  border-start-start-radius: 7px;
  border-end-start-radius: 7px;

  ${p => p.isChild && `margin-inline-start: 16px;`}

  ${p => p.isCurrent ? css`
    background-color: var(--bg);
    color: var(--fg);
  ` : css`
    background-color: var(--sidebar-bg);
    color: var(--sidebar-fg);

    &:hover {
      background-color: var(--sidebar-bg-hover);
    }
  `}

  ${p => p.isCrashed && css`
    animation-name: ${AngryShake};
    animation-duration: 600ms;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 1;
  `}

  &:focus {
    outline: none;
  }

  &:focus::before {
    content: '';
    position: absolute;
    inset-block: 1px;
    inset-inline: 1px 0;
    border: 2px solid var(--focus-border);
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
    color: ${p => p.isCurrent && p.isCrashed && 'var(--fg-danger)'};
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
    background-color: var(${p => p.isCurrentTab
      ? '--bg-pressed'
      // We use bg instead of bg-pressed since the tab has bg-hover,
      // and bg-pressed has too much contrast.
      : '--sidebar-bg'
    });
  }
`;
