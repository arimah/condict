import styled, {css} from 'styled-components';

import {Radio, ShadeGroup} from '@condict/ui';

export const Main = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-block: 8px;
  padding-inline-start: 8px;
  gap: 14px;
`;

export const Option = styled(Radio).attrs({
  marker: 'below',
})`
  flex: none;
  display: flex;

  > ${Radio.Content} {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
`;

export type SwatchProps = {
  shade: ShadeGroup;
  $selected: boolean;
};

export const Swatch = styled.span<SwatchProps>`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  width: 60px;
  height: 36px;
  border-radius: 18px;
  background-color: ${p => p.shade.bold[p.theme.mode === 'dark' ? 4 : 5]};

  ${p => p.$selected ? css`
    &::after {
      content: '';
      position: absolute;
      inset: 2px;
      border: 2px solid ${p => p.theme.defaultBg};
      border-radius: 16px;
    }
  ` : css`
    border: 2px solid ${p => p.theme.defaultBg};
  `}

`;
