import styled, {css} from 'styled-components';

export type Props = {
  minimal: boolean;
  borderRadius?: string;
};

export const Input = styled.input<Props>`
  box-sizing: border-box;
  font: inherit;
  border-radius: ${p => p.borderRadius || '3px'};
  border-color: ${p => p.theme.general.borderColor};
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};

  ${p => p.minimal ? css`
    padding: 6px;
    border-style: none;
  ` : css`
    padding: 4px;
    border-width: 2px;
    border-style: solid;
  `}

  &:focus,
  &.force-focus {
    ${p => p.theme.focus.style}
    padding: ${p => p.minimal && '4px'};
    border: 2px solid ${p => p.theme.focus.color};
  }

  &:disabled {
    border-color: ${p => p.theme.general.disabledBorderColor};
    color: ${p => p.theme.general.disabledFg};
  }

  &::placeholder {
    color: ${p => p.theme.general.fg};
    opacity: 0.65;
  }

  &:disabled::placeholder {
    color: ${p => p.theme.general.disabledFg};
  }
`;
