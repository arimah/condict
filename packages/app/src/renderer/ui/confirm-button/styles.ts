import styled, {css} from 'styled-components';

import {Button as ButtonBase, Intent} from '@condict/ui';

export const Main = styled.span`
  display: inline-flex;
  position: relative;
`;

export const Button = styled(ButtonBase)`
  flex: 1 1 auto;
  position: relative;
  z-index: 0;
  overflow: hidden;

  background-color: ${p =>
    p.theme[p.intent ?? 'general'][p.bold ? 'boldBg' : 'bg']
  };

  &:hover {
    background-color: ${p =>
      p.theme[p.intent ?? 'general'][p.bold ? 'boldHoverBg' : 'hoverBg']
    };
  }

  &:active {
    background-color: ${p =>
      p.theme[p.intent ?? 'general'][p.bold ? 'boldBg' : 'bg']
    };
  }
`;

export const Content = styled.span`
  position: relative;
  z-index: 1;
`;

export type ProgressProps = {
  intent?: Intent;
  bold?: boolean;
};

export const Progress = styled.span<ProgressProps>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 0;
  background-color: ${p =>
    p.theme[p.intent ?? 'general'][p.bold ? 'boldActiveBg' : 'activeBg']
  };
`;

export type HelperProps = {
  $visible: boolean;
};

export const Helper = styled.span.attrs({
  'aria-live': 'assertive',
  'aria-relevant': 'text',
  'aria-atomic': true,
})<HelperProps>`
  display: block;
  padding: 8px 12px;
  position: absolute;
  left: 50%;
  bottom: 100%;
  white-space: nowrap;

  border-radius: 5px;
  background-color: ${p => p.theme.general.boldBg};
  color: ${p => p.theme.general.boldFg};
  box-shadow: ${p => p.theme.shadow.elevation3};
  opacity: 0;
  transform: translateX(-50%);

  transition-property: opacity, bottom;
  transition-duration: ${p => p.theme.timing.short}ms;
  transition-timing-function: ease;

  pointer-events: none;

  ${p => p.$visible && css`
    ${Button}:focus + & {
      bottom: calc(100% + 8px);
      opacity: 1;
    }
  `}

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    width: 11px;
    height: 11px;
    background-color: ${p => p.theme.general.boldBg};
    transform: translate(-50%, -50%) rotate(45deg);
  }
`;
