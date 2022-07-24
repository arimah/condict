import styled, {css, keyframes} from 'styled-components';

import {Gray} from '../theme';

export type MenuProps = {
  open: boolean;
  submenu: boolean;
};

export const Menu = styled.div.attrs({
  role: 'menu',
  // Needs to be focusable by JS.
  tabIndex: -1,
})<MenuProps>`
  display: ${p => p.open ? 'block' : 'none'};
  padding-top: 4px;
  padding-bottom: 4px;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};
  opacity: 0;
  box-shadow: 3px 2px 4px 1px rgba(0, 0, 0, 0.45);
  user-select: none;

  &:focus {
    outline: none;
  }

  ${p => p.submenu && css`
    margin-top: -4px;
    margin-bottom: -4px;
  `}
`;

export type ItemProps = {
  current?: boolean;
  disabled?: boolean;
};

export const Item = styled.div<ItemProps>`
  display: flex;
  flex-direction: row;
  position: relative;
  white-space: nowrap;
  cursor: default;
  background-color: ${p => p.theme.general.bg};

  ${p => p.current && css`
    background-color: ${p => p.theme.general.hoverBg};
  `}

  ${p => p.disabled ? css`
    color: ${p => p.theme.general.disabledFg};
  ` : css`
    color: ${p => p.theme.general.fg};

    &:active {
      background-color: ${p => p.theme.general.activeBg};
    }
  `}
`;

export const ItemIcon = styled.span`
  display: block;
  flex: none;
  padding-inline-start: 8px;
  width: 24px;

  > .mdi-icon {
    display: block;
  }
`;

export const ItemLabel = styled.span`
  display: block;
  flex: 1 1 auto;
  padding: 4px 8px;
`;

export const ItemShortcut = styled.span`
  display: block;
  flex: none;
  padding-block: 4px;
  padding-inline: 16px 0;
`;

export const ItemSubmenu = styled.span`
  display: block;
  flex: none;
  padding-inline: 4px;
  width: 24px;

  > .mdi-icon {
    display: block;
  }
`;

export type ItemCheckProps = {
  radio: boolean;
  checked: boolean;
};

export const ItemCheck = styled.span<ItemCheckProps>`
  display: block;
  box-sizing: border-box;
  margin: 4px 8px;
  position: relative;
  width: 16px;
  height: 16px;

  border-style: solid;
  border-width: 2px;

  ${p => p.radio ? css<ItemCheckProps>`
    border-radius: 8px;
    border-color: ${p => p.checked
      ? p.theme.accent.boldBg
      : p.theme.general.border
    };
    background-color: ${p => p.theme.defaultBg};

    ${p => p.checked && css`
      &::after {
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background-color: ${p => p.theme.accent.boldBg};
        transform: translate(-50%, -50%);
      }
    `}
  ` : css<ItemCheckProps>`
    border-radius: 3px;
    border-color: ${p => p.checked
      ? p.theme.accent.boldBg
      : p.theme.general.border
    };
    background-color: ${p => p.checked
      ? p.theme.accent.boldBg
      : p.theme.defaultBg
    };

    ${p => p.checked && css`
      &::after {
        width: 10px;
        height: 6px;
        border-left: 2px solid ${p => p.theme.defaultBg};
        border-bottom: 2px solid ${p => p.theme.defaultBg};
        transform: translate(-50%, -75%) rotate(-45deg);
      }
    `}
  `}

  &::after {
    content: '';
    display: block;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
  }
`;

export const Separator = styled.div.attrs({
  role: 'separator',
})`
  margin-top: 5px;
  margin-bottom: 5px;
  border-top: 2px solid ${p => p.theme.mode === 'dark'
    ? Gray.bold[5]
    : Gray.bold[2]
  };
`;

export const PhantomFadeTime = 200;

const FadeOutAnim = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export const PhantomContainer = styled.div.attrs({
  'aria-hidden': true,
})`
  position: fixed;
  z-index: 100;
  pointer-events: none;
  animation-name: ${FadeOutAnim};
  animation-duration: ${PhantomFadeTime}ms;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
`;
