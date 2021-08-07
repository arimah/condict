import styled from 'styled-components';

import {FlowContent} from '../../../ui';

export type MainProps = {
  $open: boolean;
  visible: boolean;
};

export const Main = styled.div<MainProps>`
  display: ${p => p.visible ? 'block' : 'none'};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: ${p => p.$open ? 'auto' : 'none'};
`;

export type OverlayProps = {
  active: boolean;
};

export const Overlay = styled.div<OverlayProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${p => p.theme.defaultBg};
  opacity: ${p => p.active ? '0.6' : '0'};
  /* At least 1ms to force transitionend event even with disabled animations. */
  transition: opacity ${p => Math.max(2 * p.theme.timing.long, 1)}ms linear;
  pointer-events: ${p => p.active ? 'auto' : 'none'};
`;

export type SidePanelState = 'background' | 'current' | 'hidden';

export type SidePanelProps = {
  state: SidePanelState;
  entering: boolean;
};

// Custom transition timing functions.
const Ease = 'cubic-bezier(.45, 0, .35, 1)';
const EaseOut = 'cubic-bezier(.1, .43, .6, 1)';

export const SidePanel = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
  // You can still interact with the sidebar and other tabs.
  'aria-modal': false,
})<SidePanelProps>`
  box-sizing: border-box;
  position: absolute;
  overflow: auto;
  z-index: 0;
  top: 0;
  inset-inline-start: ${p =>
    p.state === 'background'
      ? '0'
      : p.state === 'current'
        ? 'calc(100% - min(1650px, max(85%, 584px)))'
        // Add a little extra to prevent box-shadow bleed
        : 'calc(100% + 10px)'
  };
  width: 85%;
  min-width: 584px;
  max-width: 1650px;
  height: 100%;
  background-color: ${p => p.theme.defaultBg};
  box-shadow: 0 0 6px 3px ${p => p.theme.shadow.color};

  transition:
    inset-inline-start
    ${p => 2.25 * p.theme.timing.long}ms
    ${p =>
      // When entering for the first time, use EaseOut to reveal the panel faster.
      p.entering ? EaseOut : Ease
    };

  &:focus {
    outline: none;
  }
`;

export const Content = styled.div`
  padding: 24px 32px;

  h1 {
    margin-top: 36px;
    margin-bottom: 12px;
  }

  > :first-child,
  > ${FlowContent}:first-child > :first-child {
    margin-top: 0;
  }
`;
