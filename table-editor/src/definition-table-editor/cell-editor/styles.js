import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {
  Button,
  TextInput,
  LightTheme,
} from '@condict/ui';

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

export const CellInput = styled(TextInput)`
  && {
    display: block;
    /* padding-right is 0 to leave some room for the cursor and a bit of
     * extra padding that some browsers add.
     */
    padding: 6px 0 6px 6px;
    width: 100%;
    height: 100%;
    ${ifProp('inflected', css`
      font-style: italic;
    `)}
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
  width: 200px;
  z-index: 1;

  font-weight: normal;

  border: 2px solid ${theme('general.borderColor')};
  border-radius: 3px;
  background-color: ${theme('general.altBg')};
  color: ${theme('general.altFg')};
  box-shadow: ${theme('shadow.elevation2')};

  ::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: -7px;
    left: 10px;
    width: 11px;
    height: 11px;

    border-top: 2px solid ${theme('general.borderColor')};
    border-right: 2px solid ${theme('general.borderColor')};
    background-color: ${theme('general.altBg')};
    transform: rotate(-45deg);
  }
`;

CellPopup.defaultProps = {
  theme: LightTheme,
};

export const RevertButton = styled(Button).attrs({
  slim: true,
  intent: 'secondary',
})`
  display: block;
  width: 180px;
`;

RevertButton.defaultProps = undefined;
