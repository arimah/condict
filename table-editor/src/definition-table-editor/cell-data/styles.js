import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {LightTheme} from '@condict/admin-ui';

export const CellData = styled.div`
  flex: 1 0 auto;
  padding: 6px;
  ${ifProp('inflected', css`
    font-style: italic;
  `)}
`;

CellData.defaultProps = {
  inflected: false,
  deleted: false,
};

export const DeletedForm = styled.span`
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
