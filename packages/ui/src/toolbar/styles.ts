import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {transition} from '../theme';
import LightTheme from '../theme/light';

export type ButtonProps = {
  checked?: boolean;
};

export const Toolbar = styled.div.attrs({
  role: 'toolbar',
})`
  display: flex;
  flex-direction: row;
  padding: 4px;
  flex-wrap: wrap;
  border-radius: 6px;
  background-color: ${theme('general.altBg')};
  color: ${theme('general.altFg')};
`;

Toolbar.defaultProps = {
  theme: LightTheme,
};

export const Group = styled.div.attrs({
  role: 'group' as string | undefined,
})`
  display: flex;
  flex: none;
  flex-direction: row;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-right: 16px;
  }
`;

Group.defaultProps = {
  theme: LightTheme,
};

export const Button = styled.button.attrs({
  type: 'button' as 'button' | 'submit' | 'reset' | undefined, // boo
})<ButtonProps>`
  flex: none;
  padding: 6px 8px;
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: none;
  border-radius: 4px;
  background-color: ${theme('general.altBg')};
  color: ${theme('general.altFg')};

  ${transition('color, background-color')}

  &:not(:first-child) {
    margin-left: 2px;
  }

  &:focus {
    padding: 4px 6px;
    border: 2px solid ${theme('focus.color')};
    ${theme('focus.style')};
  }

  &:hover {
    background-color: ${theme('general.hoverAltBg')};
  }

  &:active {
    background-color: ${theme('general.activeAltBg')};
  }

  ${ifProp('checked', css`
    && {
      background-color: ${theme('general.activeAltBg')};
    }
  `)}

  &:disabled {
    background-color: ${theme('general.altBg')};
    color: ${theme('general.disabledAltFg')};
  }

  > .mdi-icon {
    margin-top: -3px;
    margin-bottom: -3px;
    vertical-align: -4px;

    :first-child {
      margin-left: -4px;
    }
    :last-child {
      margin-right: -4px;
    }
  }
`;

export const Spacer = styled.div`
  flex: 1 0 auto;
`;
