import styled, {css} from 'styled-components';

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
    color: ${p => p.theme.accent[p.disabled ? 'disabledFg' : 'defaultFg']};
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
    p.disabled ? 'disabledBorder' : 'border'
  ]};
`;
