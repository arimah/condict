import styled, {css} from 'styled-components';

import {Button, TextInput} from '@condict/ui';

import {CellPopup as CellPopupBase} from '../../cell-dialog';

export const CellPopup = styled(CellPopupBase)`
  max-width: 292px;
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

  border: 2px solid ${p => p.theme.general.border};
  background-color: ${p => p.theme.defaultBg};

  ${p => p.focus && css`
    outline: none;
    border-color: ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  `}
`;

// NOTE: This styling must be synchronized with the one in ../cell-data/styles
export const CellIcons = styled.span`
  display: block;
  margin-inline-end: 5px;

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
    padding-block: 6px;
    /* padding-inline-end is 0 to leave some room for the cursor and a bit of
     * extra padding that is sometimes added.
     */
    padding-inline: 6px 0;
    width: 50%;
    height: 100%;
  }

  &&:focus {
    padding-block: 6px;
    padding-inline: 6px 0;
    border: none;
    box-shadow: none;
  }
`;


export const CellSettingsGroup = styled.div`
  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const CellSettingsSeparator = styled.div`
  margin-block: 15px;
  border-top: 2px solid ${p => p.theme.general.border};
`;

export const DisplayNameLabel = styled.label`
  display: block;
  margin-bottom: 8px;
`;

export const DisplayNameInput = styled(TextInput)`
  display: block;
  width: 256px;
`;

export const DeriveDisplayNameButton = styled(Button).attrs({
  slim: true,
  bold: true,
})`
  display: block;
  width: 256px;
`;

DeriveDisplayNameButton.defaultProps = undefined;

export const DisplayNameDesc = styled.div`
  white-space: normal;
`;
