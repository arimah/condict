import styled, {css} from 'styled-components';
import {theme, ifProp, ifNotProp} from 'styled-tools';

import LightTheme from '../theme/light';

import {DeleteIcon} from './icons';

const Transition = property => css`
  transition-duration: ${theme('timing.short')};
  transition-timing-function: ease-in-out;
  transition-property: ${property};
`;

export const Main = styled.span`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: row;
  flex-wrap: wrap;
  cursor: ${ifNotProp('disabled', 'text')};
  width: 400px;
  border-radius: 3px;
  border-color: ${theme('general.borderColor')};
  background-color: ${theme('general.bg')};
  color: ${theme('general.fg')};

  ${Transition('border-color, color')}

  ${ifProp('minimal',
    css`
      padding: 2px;
      border-style: none;
    `,
    css`
      padding: 0;
      border-width: 2px;
      border-style: solid;
    `
  )}

  ${ifProp('inputFocused', css`
    ${theme('focus.style')}
    padding: ${ifProp('minimal', '0')};
    border: 2px solid ${theme('focus.color')};
  `)}

  ${ifProp('disabled', css`
    border-color: ${theme('general.disabledBorderColor')};
    color: ${theme('general.disabledFg')};
  `)}
`;

Main.defaultProps = {
  theme: LightTheme,
};

export const Tag = styled.button.attrs({
  type: 'button',
})`
  display: inline-block;
  box-sizing: border-box;
  flex: none;
  margin: 1px;
  padding: 1px 20px 1px 8px;
  position: relative;
  max-width: calc(100% - 2px);
  font: inherit;
  text-align: left;
  background-color: ${theme('general.altBg')};
  border: 2px solid ${theme('general.altBg')};
  border-radius: 13px;
  color: ${theme('general.altFg')};
  cursor: default;

  ${Transition('background-color, border-color, color, padding')}

  ${ifProp('disabled', css`
    &&& {
      padding-left: 14px;
      padding-right: 14px;
      background-color: ${theme('general.disabledAltBg')};
      border-color: ${theme('general.disabledAltBg')};
      color: ${theme('general.disabledAltFg')};
    }
  `)}

  &:hover {
    background-color: ${theme('danger.hoverAltBg')};
    border-color: ${theme('danger.hoverAltBg')};
    color: ${theme('danger.altFg')};
  }

  &:active {
    background-color: ${theme('danger.activeAltBg')};
    border-color: ${theme('danger.activeAltBg')};
    color: ${theme('danger.altFg')};
  }

  &:focus {
    ${theme('focus.style')}
    outline: none;
    border-color: ${theme('focus.color')};
  }
`;

Tag.defaultProps = {
  theme: LightTheme,
};

export const DeleteMarker = styled(DeleteIcon)`
  position: absolute;
  right: 8px;
  top: 50%;
  margin-top: -4px;
  opacity: 0.25;

  ${Transition('opacity')}

  ${Tag}:hover & {
    opacity: 1;
  }
`;

export const Input = styled.input.attrs({
  type: 'text',
})`
  box-sizing: border-box;
  flex: 1 1 auto;
  padding: 4px;
  font: inherit;
  min-width: 75px;
  border: none;
  border-radius: 0;
  background-color: ${theme('general.bg')};
  color: ${theme('general.fg')};

  &:focus {
    outline: none;
  }

  &:disabled {
    color: ${theme('general.disabledFg')};
  }
`;
