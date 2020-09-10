import styled, {css} from 'styled-components';

import {Button, TextInput} from '@condict/ui';

import {CellPopup as CellPopupBase} from '../../cell-dialog';

export type CellInputProps = {
  inflected: boolean;
};

export const CellInput = styled(TextInput).attrs({
  borderRadius: '0',
})<CellInputProps>`
  && {
    display: block;
    /* padding-right is 0 to leave some room for the cursor and a bit of
     * extra padding that some browsers add.
     */
    padding: 6px 0 6px 6px;
    width: 100%;
    height: 100%;
    ${p => p.inflected && css`
      font-style: italic;
    `}
  }
`;

export const CellPopup = styled(CellPopupBase)`
  width: 200px;
`;

export const RevertButton = styled(Button).attrs({
  slim: true,
  bold: true,
  intent: 'secondary',
})`
  display: block;
  width: 180px;
`;

RevertButton.defaultProps = undefined;
