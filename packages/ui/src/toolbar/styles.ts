import styled, {css} from 'styled-components';

import {transition} from '../theme';

export type ButtonProps = {
  checked?: boolean;
};

export const Toolbar = styled.div.attrs({
  role: 'toolbar',
})`
  display: flex;
  flex-direction: row;
  padding: 4px;
  flex-wrap: wrap;
  border-radius: 6px;
  background-color: ${p => p.theme.general.altBg};
  color: ${p => p.theme.general.altFg};
`;

export const Group = styled.div.attrs({
  role: 'group' as string | undefined,
})`
  display: flex;
  flex: none;
  flex-direction: row;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-right: 16px;
  }
`;

export const Button = styled.button.attrs({
  type: 'button' as 'button' | 'submit' | 'reset' | undefined, // boo
})<ButtonProps>`
  flex: none;
  padding: 6px 8px;
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: none;
  border-radius: 4px;
  background-color: ${p => p.theme.general.altBg};
  color: ${p => p.theme.general.altFg};

  ${transition('color, background-color')}

  &:not(:first-child) {
    margin-left: 2px;
  }

  &:focus {
    padding: 4px 6px;
    border: 2px solid ${p => p.theme.focus.color};
    ${p => p.theme.focus.style};
  }

  &:hover {
    background-color: ${p => p.theme.general.hoverAltBg};
  }

  &:active {
    background-color: ${p => p.theme.general.activeAltBg};
  }

  ${p => p.checked && css`
    && {
      background-color: ${p => p.theme.general.activeAltBg};
    }
  `}

  &:disabled {
    background-color: ${p => p.theme.general.altBg};
    color: ${p => p.theme.general.disabledAltFg};
  }

  > .mdi-icon {
    margin-top: -3px;
    margin-bottom: -3px;
    vertical-align: -4px;

    :first-child {
      margin-left: -4px;
    }
    :last-child {
      margin-right: -4px;
    }
  }
`;

export const Spacer = styled.div`
  flex: 1 0 auto;
`;
