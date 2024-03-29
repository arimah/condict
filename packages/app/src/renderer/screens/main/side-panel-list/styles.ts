import styled from 'styled-components';

import {FlowContent} from '../../../ui';

export const Main = styled.div<{
  $open: boolean;
  $visible: boolean;
}>`
  display: ${p => p.$visible ? 'block' : 'none'};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: ${p => p.$open ? 'auto' : 'none'};
`;

export const Overlay = styled.div<{
  $active: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg);
  opacity: ${p => p.$active ? '0.6' : '0'};
  transition: opacity ${p => 2 * p.theme.timing.long}ms linear;
  pointer-events: ${p => p.$active ? 'auto' : 'none'};
`;

export type SidePanelState = 'background' | 'current' | 'hidden';

// Custom transition timing functions.
const Ease = 'cubic-bezier(.45, 0, .35, 1)';
const EaseOut = 'cubic-bezier(.1, .43, .6, 1)';

export const SidePanel = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
  // You can still interact with the sidebar and other tabs.
  'aria-modal': false,
})<{
  $state: SidePanelState;
  $entering: boolean;
}>`
  box-sizing: border-box;
  position: absolute;
  overflow: auto;
  z-index: 0;
  top: 0;
  inset-inline-start: ${p =>
    p.$state === 'background'
      ? '0'
      : p.$state === 'current'
        ? 'calc(100% - min(1650px, max(85%, 584px)))'
        // Add a little extra to prevent box-shadow bleed
        : 'calc(100% + 10px)'
  };
  width: 85%;
  min-width: 584px;
  max-width: 1650px;
  height: 100%;
  background-color: var(--bg);
  box-shadow: 0 0 6px 3px var(--shadow-color);

  transition:
    inset-inline-start
    ${p =>
      // At least 1ms to force transitionend event even with disabled animations.
      Math.max(2.25 * p.theme.timing.long, 1)
    }ms
    ${p =>
      // When entering for the first time, use EaseOut to reveal the panel faster.
      p.$entering ? EaseOut : Ease
    };

  &:focus {
    outline: none;
  }
`;

export const Content = styled.div`
  padding: 24px 32px;

  h1 {
    margin-block: 36px 12px;
  }

  > :first-child,
  > ${FlowContent}:first-child > :first-child {
    margin-top: 0;
  }
`;
