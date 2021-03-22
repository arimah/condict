import styled, {css} from 'styled-components';

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
  background-color: ${p => p.theme.general.altBg};
  color: ${p => p.theme.general.altFg};
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
  background-color: ${p => p.theme.general.altBg};

  ${p => p.current && css`
    background-color: ${p => p.theme.general.hoverAltBg};
  `}

  ${p => p.disabled ? css`
    color: ${p => p.theme.general.disabledAltFg};
  ` : css`
    color: ${p => p.theme.general.altFg};

    &:active {
      background-color: ${p => p.theme.general.activeAltBg};
    }
  `}
`;

export const ItemIcon = styled.span`
  display: block;
  flex: none;
  padding-left: 8px;
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
  padding: 4px 0 4px 16px;
`;

export const ItemSubmenu = styled.span`
  display: block;
  flex: none;
  padding-left: 4px;
  padding-right: 4px;
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
      ? p.theme.primary.altBg
      : p.theme.general.borderColor
    };
    background-color: ${p => p.theme.general.bg};
  ` : css<ItemCheckProps>`
    border-radius: 3px;
    border-color: ${p => p.checked
      ? p.theme.primary.altBg
      : p.theme.general.borderColor
    };
    background-color: ${p => p.checked
      ? p.theme.primary.altBg
      : p.theme.general.bg
    };
  `}
`;

export const CheckMark = styled.span`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 6px;
  border-left: 2px solid ${p => p.theme.general.bg};
  border-bottom: 2px solid ${p => p.theme.general.bg};
  transform: translate(-50%, -75%) rotate(-45deg);
`;

export const RadioDot = styled.span`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${p => p.theme.primary.altBg};
  transform: translate(-50%, -50%);
`;

export const Separator = styled.div.attrs({
  role: 'separator',
})`
  margin-top: 3px;
  margin-bottom: 3px;
  border-top: 2px solid ${p => p.theme.general.borderColor};
`;

export const PhantomFadeTime = 200;

export const PhantomContainer = styled.div`
  position: fixed;
  pointer-events: none;
  transition: opacity ${PhantomFadeTime}ms ease-in;
`;
