import styled from 'styled-components';

import {Button} from '../button';

export const Main = styled.nav<{
  $disabled: boolean;
}>`
  margin-top: 16px;
  margin-bottom: 16px;
  color: var(${p => p.$disabled ? '--fg-disabled' : '--fg'});
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

export const Page = styled(Button)<{
  $isLoading?: boolean;
}>`
  display: flex;
  padding-inline: 2px;
  min-width: 32px;

  ${p => p.$isLoading && `
    && {
      color: transparent;
    }
  `}
`;

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

export const Loading = styled.div<{
  $disabled: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  color: var(${p => p.$disabled
    ? '--button-bold-fg-disabled'
    : '--button-bold-fg'
  });
`;
