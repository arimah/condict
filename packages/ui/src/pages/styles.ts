import styled, {css} from 'styled-components';

import {Button} from '../button';

export type DisabledProps = {
  disabled: boolean;
};

export const Main = styled.nav<DisabledProps>`
  margin-top: 16px;
  margin-bottom: 16px;

  color: ${p => p.disabled
    ? p.theme.general.disabledFg
    : p.theme.defaultFg
  };
`;

// This list and its items are necessary for assisitive technologies to read
// the pages correctly.
export const List = styled.ul`
  flex: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 8px;
  list-style-type: none;
  gap: 4px;
  border-radius: 13px;
`;

export const Item = styled.li`
  flex: none;
  display: inline-block;
  margin: 0;
  position: relative;
`;

export type PageProps = {
  isLoading?: boolean;
};

export const Page = styled(Button)<PageProps>`
  display: block;
  padding: 6px 2px;
  min-width: 32px;

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
  min-width: 32px;
  text-align: center;
  cursor: default;

  &:focus {
    outline: none;
  }
`;

export const Loading = styled.div<DisabledProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;

  color: ${p => p.theme.general[p.disabled ? 'boldDisabledFg' : 'boldFg']};
`;
