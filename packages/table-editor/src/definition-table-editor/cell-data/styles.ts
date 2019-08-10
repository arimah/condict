import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {LightTheme} from '@condict/ui';

export type CellDataProps = {
  inflected?: boolean;
};

export const CellData = styled.div<CellDataProps>`
  flex: 1 0 auto;
  padding: 6px;
  ${ifProp('inflected', css`
    font-style: italic;
  `)}
`;

export type DeletedFormProps = {
  disabled: boolean;
};

export const DeletedForm = styled.span<DeletedFormProps>`
  display: inline-block;
  width: 16px;
  height: 2px;
  vertical-align: middle;
  background-color: ${ifProp('disabled',
    theme('general.disabledBorderColor'),
    theme('general.borderColor')
  )};
`;

DeletedForm.defaultProps = {
  theme: LightTheme,
};
