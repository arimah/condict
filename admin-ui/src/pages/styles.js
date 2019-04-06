import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import LightTheme from '../theme/light';
import {Button} from '../button';

export const Main = styled.nav`
  margin-top: 16px;
  margin-bottom: 16px;

  color: ${ifProp('disabled',
    theme('general.disabledFg'),
    theme('general.fg')
  )};
`;

Main.defaultProps = {
  theme: LightTheme,
};

// This list and its items are necessary for assisitive technologies to read
// the pages correctly.
export const List = styled.ul`
  display: block;
  list-style-type: none;
`;

export const Item = styled.li`
  display: inline-block;
  position: relative;
`;

export const Page = styled(Button).attrs({
  minimal: true,
  intent: 'secondary',
})`
  display: block;
  min-width: 36px;

  ${ifProp('current',
    css`
      padding: 6px 4px;
      border: 2px solid ${theme('general.borderColor')};

      &:disabled {
        border-color: ${theme('general.disabledBorderColor')};
      }
    `,
    css`
      padding: 8px 6px;
    `
  )}

  &:focus {
    padding: 6px 4px;
  }

  ${ifProp('loading', css`
    && {
      color: transparent;
    }
  `)}

  & > .mdi-icon {
    vertical-align: -5px;
  }
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
