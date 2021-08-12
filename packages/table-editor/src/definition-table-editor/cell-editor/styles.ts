import styled, {css} from 'styled-components';

import {Button, TextInput} from '@condict/ui';

import CellPopupBase from '../../cell-popup';

export type CellInputProps = {
  inflected: boolean;
};

export const CellInput = styled(TextInput).attrs({
  borderRadius: '0',
})<CellInputProps>`
  && {
    display: block;
    padding-block: 6px;
    /* padding-inline-end is 0 to leave some room for the cursor and a bit of
     * extra padding that some browsers add.
     */
    padding-inline: 6px 0;
    width: 100%;
    height: 100%;
    ${p => p.inflected && css`
      font-style: italic;
    `}
  }
`;

export const CellPopup = styled(CellPopupBase)`
  width: 216px;
`;

export const RevertButton = styled(Button).attrs({
  slim: true,
  bold: true,
})`
  display: block;
  width: 184px;
`;

RevertButton.defaultProps = undefined;
