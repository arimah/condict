import styled from 'styled-components';

import {Button, TextInput} from '@condict/ui';

import CellPopupBase from '../../cell-popup';

export const CellPopup = styled(CellPopupBase)`
  max-width: 360px;
  white-space: nowrap;
`;

export const CellInputWrapper = styled.label<{
  $focus: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
  align-items: center;
  cursor: text;

  border: 2px solid var(--input-border);
  background-color: var(--input-bg);

  ${p => p.$focus && `
    outline: none;
    border-color: var(--focus-border);
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

export const CellInput = styled(TextInput)`
  display: block;
  flex: 1 1 auto;
  padding-block: 6px;
  /* padding-inline-end is 0 to leave some room for the cursor and a bit of
   * extra padding that is sometimes added.
   */
  padding-inline: 6px 0;
  width: 50%;
  height: 100%;
  border-style: none;
  border-radius: 0;
`;


export const CellSettingsGroup = styled.div`
  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const CellSettingsSeparator = styled.div`
  margin-block: 15px;
  border-top: 2px solid var(--border-control);
`;

export const DisplayNameLabel = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  /*
   * Set the width explicitly here to normalize the popup size; otherwise it
   * changes with the presence of DeriveDisplayNameButton.
   */
  width: 328px;

  > span {
    flex: none;
    align-self: flex-start;
  }

  > input {
    flex: none;
  }
`;

export const DeriveDisplayNameButton = styled(Button).attrs({
  slim: true as const,
  intent: 'bold' as const,
})`
  display: flex;
  width: 100%;
`;

DeriveDisplayNameButton.defaultProps = undefined;

export const DisplayNameDesc = styled.div`
  white-space: normal;
`;
