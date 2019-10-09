import styled, {css} from 'styled-components';

import {transition} from '../theme';

export type Props = {
  minimal: boolean;
  autoSize?: boolean;
  borderRadius?: string;
};

export const Input = styled.input<Props>`
  box-sizing: border-box;
  font: inherit;
  border-radius: ${p => p.borderRadius || '3px'};
  border-color: ${p => p.theme.general.borderColor};
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};

  ${transition('border-color, color')}

  ${p => p.minimal ? css`
    padding: 6px;
    border-style: none;
  ` : css`
    padding: 4px;
    border-width: 2px;
    border-style: solid;
  `}

  ${p => p.autoSize && css`
    /* Edge's "x" button; it messes up the size calculation. */
    &::-ms-clear {
      display: none;
    }
  `}

  &:focus {
    ${p => p.theme.focus.style}
    padding: ${p => p.minimal && '4px'};
    border: 2px solid ${p => p.theme.focus.color};
  }

  &:disabled {
    border-color: ${p => p.theme.general.disabledBorderColor};
    color: ${p => p.theme.general.disabledFg};
  }

  &::placeholder {
    ${transition('color')}
    color: ${p => p.theme.general.fg};
    opacity: 0.65;
  }

  &:disabled::placeholder {
    color: ${p => p.theme.general.disabledFg};
  }
`;
