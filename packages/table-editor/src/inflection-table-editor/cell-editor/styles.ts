import styled, {css} from 'styled-components';

import {Button, TextInput} from '@condict/ui';

import {CellPopup as CellPopupBase} from '../../cell-dialog';

export const CellPopup = styled(CellPopupBase)`
  max-width: 280px;
  white-space: nowrap;
`;

export type CellInputWrapperProps = {
  focus: boolean;
};

export const CellInputWrapper = styled.label<CellInputWrapperProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
  align-items: center;
  cursor: text;

  border: 2px solid ${p => p.theme.general.borderColor};
  background-color: ${p => p.theme.general.bg};

  ${p => p.focus && css`
    ${p => p.theme.focus.style}
    border-color: ${p => p.theme.focus.color};
  `}
`;

// NOTE: This styling must be synchronized with the one in ../cell-data/styles
export const CellIcons = styled.span`
  display: block;
  margin-right: 5px;

  > svg {
    display: block;
  }

  > svg:not(:first-child) {
    margin-top: 2px;
  }
`;

export const CellInput = styled(TextInput).attrs({
  minimal: true,
  borderRadius: '0',
})`
  && {
    display: block;
    flex: 1 1 auto;
    /* padding-right is 0 to leave some room for the cursor and a bit of
     * extra padding that some browsers add.
     */
    padding: 6px 0 6px 6px;
    width: 50%;
    height: 100%;
  }

  &&:focus {
    padding: 6px 0 6px 6px;
    border: none;
    box-shadow: none;
  }
`;


export const CellSettingsGroup = styled.div`
  &:not(:first-child) {
    margin-top: 5px;
  }
`;

export const CellSettingsSeparator = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  border-top: 1px solid ${p => p.theme.general.borderColor};
`;

export const DisplayNameLabel = styled.label`
  display: block;
  margin-bottom: 5px;
`;

export const DisplayNameInput = styled(TextInput)`
  display: block;
  margin-top: 3px;
  width: 260px;
`;

export const DeriveDisplayNameButton = styled(Button).attrs({
  slim: true,
  bold: true,
  intent: 'secondary',
})`
  display: block;
  width: 260px;
`;

DeriveDisplayNameButton.defaultProps = undefined;

export const DisplayNameDesc = styled.div`
  white-space: normal;
`;
