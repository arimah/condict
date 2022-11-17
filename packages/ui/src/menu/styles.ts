import styled, {keyframes} from 'styled-components';

export const MenuPaddingBlock = 4;

export const Menu = styled.div.attrs({
  role: 'menu',
  // Needs to be focusable by JS.
  tabIndex: -1,
})<{
  $open: boolean;
}>`
  display: ${p => p.$open ? 'block' : 'none'};
  padding-block: ${MenuPaddingBlock}px;
  position: fixed;
  top: 0;
  left: 0;
  border-radius: 4px;
  background-color: var(--menu-bg);
  color: var(--menu-fg);
  opacity: 0;
  box-shadow: 3px 2px 4px 1px rgba(0, 0, 0, 0.45);
  user-select: none;

  &:focus {
    outline: none;
  }
`;

export const Item = styled.div<{
  $current?: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 24px;
  position: relative;
  white-space: nowrap;
  cursor: default;
  background-color: var(${p => p.$current
    ? '--menu-bg-selected'
    : '--menu-bg'
  });
  color: var(${p => p.$disabled ? '--menu-fg-disabled' : '--menu-fg'});
`;

export const ItemIcon = styled.span`
  flex: none;
  padding-inline-start: 8px;
  width: 24px;

  > .mdi-icon {
    display: block;
  }
`;

export const ItemLabel = styled.span`
  flex: 1 1 auto;
  padding: 3px 8px;
`;

export const ItemShortcut = styled.span`
  flex: none;
  padding-block: 3px;
  padding-inline: 16px 0;
`;

export const ItemSubmenu = styled.span`
  flex: none;
  padding-inline: 4px;
  width: 24px;

  > .mdi-icon {
    display: block;
  }
`;

export const ItemCheck = styled.span<{
  $radio: boolean;
  $checked: boolean;
}>`
  display: block;
  box-sizing: border-box;
  margin: 4px 8px;
  position: relative;
  width: 16px;
  height: 16px;

  border-style: solid;
  border-width: 2px;

  ${p => p.$radio ? `
    border-radius: 8px;
    border-color: var(${p.$checked
      ? '--radio-border-checked'
      : '--radio-border'
    });
    background-color: var(--radio-bg);

    ${p.$checked && `
      &::after {
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background-color: var(--radio-fg);
        transform: translate(-50%, -50%);
      }
    `}
  ` : `
    border-radius: 3px;
    border-color: var(${p.$checked
      ? '--checkbox-border-checked'
      : '--checkbox-border'
    });
    background-color: var(${p.$checked
      ? '--checkbox-bg-checked'
      : '--checkbox-bg'
    });

    ${p.$checked && `
      &::after {
        width: 10px;
        height: 6px;
        border-left: 2px solid var(--checkbox-fg);
        border-bottom: 2px solid var(--checkbox-fg);
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
  border-top: 2px solid var(--menu-separator);
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
