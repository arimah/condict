import styled from 'styled-components';

import {Button, TextInput} from '@condict/ui';

import CellPopupBase from '../../cell-popup';

export type CellInputProps = {
  inflected: boolean;
};

export const CellInput = styled(TextInput)<CellInputProps>`
  display: block;
  border-radius: 0;
  width: 100%;
  height: 100%;
  ${p => p.inflected && `font-style: italic;`}

  && {
    padding-block: 6px;
    /* padding-inline-end is 0 to leave some room for the cursor and a bit of
     * extra padding that some browsers add.
     */
    padding-inline: 6px 0;
  }
`;

export const CellPopup = styled(CellPopupBase)`
  width: 216px;
`;

export const RevertButton = styled(Button).attrs({
  slim: true,
  intent: 'bold',
})`
  display: block;
  width: 184px;
`;

RevertButton.defaultProps = undefined;
