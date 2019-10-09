import styled, {css} from 'styled-components';

import {Saturation, makeColorFn} from '@condict/ui';

const stemColor = makeColorFn(291, {
  high: 70,
  low: 45,
});

// 'light' and 'dark' here mean for light and dark themes, respectively.
const lightStemColor = stemColor(Saturation.HIGH, 35);
const disabledLightStemColor = stemColor(Saturation.LOW, 80);
const darkStemColor = stemColor(Saturation.HIGH, 65);
const disabledDarkStemColor = stemColor(Saturation.LOW, 35);

export type CellDataProps = {
  inflected?: boolean;
  custom?: boolean;
  disabled?: boolean;
};

export const CellData = styled.div<CellDataProps>`
  flex: 1 0 auto;
  padding: 6px;
  ${p => p.inflected && `font-style: italic;`}
  ${p => p.custom && css<CellDataProps>`
    color: ${p => p.theme.dark
      ? (p.disabled ? disabledDarkStemColor : darkStemColor)
      : (p.disabled ? disabledLightStemColor : lightStemColor)
    };
  `}
`;

export type DeletedFormProps = {
  disabled: boolean;
};

export const DeletedForm = styled.span<DeletedFormProps>`
  display: inline-block;
  width: 16px;
  height: 2px;
  vertical-align: middle;
  background-color: ${p => p.theme.general[
    p.disabled ? 'disabledBorderColor' : 'borderColor'
  ]};
`;
