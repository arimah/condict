import styled, {css} from 'styled-components';

import {Button} from '../button';

export type DisabledProps = {
  disabled: boolean;
};

export type PageProps = {
  current?: boolean;
  isLoading?: boolean;
};

export const Main = styled.nav<DisabledProps>`
  margin-top: 16px;
  margin-bottom: 16px;

  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};
`;

// This list and its items are necessary for assisitive technologies to read
// the pages correctly.
export const List = styled.ul`
  display: block;
  padding: 0;
  list-style-type: none;
`;

export const Item = styled.li`
  display: inline-block;
  position: relative;
`;

export const Page = styled(Button).attrs({
  type: 'button',
  slim: false,
  intent: 'secondary',
})<PageProps>`
  display: block;
  padding: 6px 4px;
  min-width: 36px;
  border-color: transparent;
  background-color: transparent;

  &:disabled {
    border-color: transparent;
    background-color: transparent;
  }

  ${p => p.current && css`
    border-color: ${p => p.theme.general.borderColor};

    &:disabled {
      border-color: ${p => p.theme.general.disabledBorderColor};
    }
  `}

  ${p => p.isLoading && css`
    && {
      color: transparent;
    }
  `}
`;

Page.defaultProps = {};

// This element is focusable only for screen reader accessibility.
export const Ellipsis = styled.span.attrs({
  tabIndex: -1,
})`
  display: block;
  box-sizing: border-box;
  padding: 8px;
  min-width: 36px;
  text-align: center;

  &:focus {
    outline: none;
  }
`;

export const Loading = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;
