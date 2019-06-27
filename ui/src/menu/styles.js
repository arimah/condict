import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {transition} from '../theme';
import LightTheme from '../theme/light';

export const Menu = styled.div.attrs({
  role: 'menu',
  // Needs to be focusable by JS.
  tabIndex: -1,
})`
  display: ${ifProp('open', 'block', 'none')};
  padding-top: 4px;
  padding-bottom: 4px;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
  background-color: ${theme('general.altBg')};
  color: ${theme('general.altFg')};
  box-shadow: 3px 2px 4px 1px rgba(0, 0, 0, 0.45);

  &:focus {
    outline: none;
  }

  ${ifProp('submenu', css`
    margin-top: -4px;
    margin-bottom: -4px;
  `)}
`;

Menu.defaultProps = {
  theme: LightTheme,
};

export const Item = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  white-space: nowrap;
  cursor: default;
  background-color: ${theme('general.altBg')};

  ${transition('background-color, color')}

  ${ifProp('current', css`
    background-color: ${theme('general.hoverAltBg')};
  `)}

  ${ifProp('disabled',
    css`
      color: ${theme('general.disabledAltFg')};
    `,
    css`
      color: ${theme('general.altFg')};

      &:active {
        background-color: ${theme('general.activeAltBg')};
      }
    `)}
`;

Item.defaultProps = {
  theme: LightTheme,
};

export const ItemIcon = styled.span`
  display: block;
  flex: none;
  padding: 1px 0 1px 4px;
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
  padding: 1px 4px;
  width: 24px;

  > .mdi-icon {
    display: block;
  }
`;

export const ItemCheck = styled.span`
  display: block;
  box-sizing: border-box;
  margin: 4px 7px;
  position: relative;
  width: 18px;
  height: 18px;

  border-style: solid;
  border-width: 2px;

  ${ifProp('radio',
    css`
      border-radius: 9px;
      border-color: ${ifProp('checked',
        theme('primary.altBg'),
        theme('general.borderColor')
      )};
      background-color: ${theme('general.bg')};
    `,
    css`
      border-radius: 3px;
      border-color: ${ifProp('checked',
        theme('primary.altBg'),
        theme('general.borderColor')
      )};
      background-color: ${ifProp('checked',
        theme('primary.altBg'),
        theme('general.bg')
      )};
    `)}

`;

ItemCheck.defaultProps = {
  theme: LightTheme,
};

export const CheckMark = styled.span`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 6px;
  border-left: 2px solid ${theme('general.bg')};
  border-bottom: 2px solid ${theme('general.bg')};
  transform: translate(-50%, -75%) rotate(-45deg);
`;

CheckMark.defaultProps = {
  theme: LightTheme,
};

export const RadioDot = styled.span`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${theme('primary.altBg')};
  transform: translate(-50%, -50%);
`;

RadioDot.defaultProps = {
  theme: LightTheme,
};

export const Separator = styled.div.attrs({
  role: 'separator',
})`
  margin-top: 4px;
  margin-bottom: 4px;
  border-top: 2px solid ${theme('general.borderColor')};
`;

Separator.defaultProps = {
  theme: LightTheme,
};

export const PhantomFadeTime = 200;

export const PhantomContainer = styled.div`
  position: fixed;
  pointer-events: none;
  transition: opacity ${PhantomFadeTime}ms ease-in;
`;
