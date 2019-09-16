import styled, {css} from 'styled-components';

import {Button, TextInput, LightTheme, Intent} from '@condict/ui';

export const CellEditor = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: 3;

  &:focus {
    outline: none;
  }
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

CellInputWrapper.defaultProps = {
  theme: LightTheme,
};

export type CellIconsProps = {
  disabled?: boolean;
};

export const CellIcons = styled.span<CellIconsProps>`
  display: block;
  margin-right: 5px;

  opacity: ${p => p.disabled && '0.4'};

  > svg {
    display: block;
  }

  > svg:not(:first-child) {
    margin-top: 2px;
  }
`;

export const CellInput = styled(TextInput)`
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

  /* The "x" button that Edge enforces... */
  &&::-ms-clear {
    display: none;
  }
`;

export const CellPopup = styled.div`
  box-sizing: border-box;
  margin-top: 5px;
  padding: 8px;
  position: absolute;
  top: 100%;
  left: -8px;
  max-width: 280px;
  z-index: 1;

  font-weight: normal;
  white-space: nowrap;

  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 3px;
  background-color: ${p => p.theme.general.altBg};
  color: ${p => p.theme.general.altFg};
  box-shadow: ${p => p.theme.shadow.elevation2};

  ::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: -7px;
    left: 10px;
    width: 11px;
    height: 11px;

    border-top: 2px solid ${p => p.theme.general.borderColor};
    border-right: 2px solid ${p => p.theme.general.borderColor};
    background-color: ${p => p.theme.general.altBg};
    transform: rotate(-45deg);
  }
`;

CellPopup.defaultProps = {
  theme: LightTheme,
};

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

CellSettingsSeparator.defaultProps = {
  theme: LightTheme,
};

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
  intent: Intent.SECONDARY,
})`
  display: block;
  width: 260px;
`;

DeriveDisplayNameButton.defaultProps = undefined;

export const DisplayNameDesc = styled.div`
  white-space: normal;
`;

DisplayNameDesc.defaultProps = {
  theme: LightTheme,
};
