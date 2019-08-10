import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {LightTheme} from '@condict/ui';

export type GroupProps = {
  hasBase: boolean;
};

export const Group = styled.div.attrs({
  role: 'group',
})<GroupProps>`
  ${ifProp('hasBase', css`
    margin-left: 42px;
    text-indent: -42px;
  `)}

  &:not(:first-child) {
    margin-top: ${ifProp('hasBase', '4px', '8px')};
  }
`;

export const GroupName = styled.div`
  font-weight: bold;
  font-size: 11pt;
`;

export type CharacterProps = {
  isBase: boolean;
};

export const Character = styled.span<CharacterProps>`
  display: inline-block;
  margin-right: 2px;
  margin-bottom: 2px;
  padding: 4px;
  min-width: 32px;
  text-indent: 0;
  text-align: center;
  font-size: 17pt;
  cursor: default;

  background-color: ${theme('general.altBg')};
  font-weight: ${ifProp('isBase', 'bold')};

  &:hover {
    background-color: ${theme('general.hoverAltBg')};
  }
`;

Character.defaultProps = {
  theme: LightTheme,
};
