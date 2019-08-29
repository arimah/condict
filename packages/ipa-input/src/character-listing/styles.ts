import styled, {css} from 'styled-components';

import {LightTheme} from '@condict/ui';

export type GroupProps = {
  hasBase: boolean;
};

export const Group = styled.div.attrs({
  role: 'group',
})<GroupProps>`
  ${p => p.hasBase && css`
    margin-left: 42px;
    text-indent: -42px;
  `}

  &:not(:first-child) {
    margin-top: ${p => p.hasBase ? '4px' : '8px'};
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

  background-color: ${p => p.theme.general.altBg};
  font-weight: ${p => p.isBase && 'bold'};

  &:hover {
    background-color: ${p => p.theme.general.hoverAltBg};
  }
`;

Character.defaultProps = {
  theme: LightTheme,
};
