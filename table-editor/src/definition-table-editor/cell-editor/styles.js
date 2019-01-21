import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {
  Button,
  TextInput,
  LightTheme,
} from '@condict/admin-ui';

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

  border: 2px solid ${theme('primary.borderColor')};
  border-radius: 3px;
  background-color: ${theme('primary.bg')};
  color: ${theme('general.fg')};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

  ::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: -7px;
    left: 10px;
    width: 11px;
    height: 11px;

    border-top: 2px solid ${theme('primary.borderColor')};
    border-right: 2px solid ${theme('primary.borderColor')};
    background-color: ${theme('primary.bg')};
    transform: rotate(-45deg);
  }
`;

CellPopup.defaultProps = {
  theme: LightTheme,
};

export const RevertButton = styled(Button)`
  display: block;
  width: 180px;
`;
