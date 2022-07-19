import styled, {css} from 'styled-components';

export type Props = {
  minimal: boolean;
  borderRadius?: string;
};

export const Input = styled.input<Props>`
  box-sizing: border-box;
  font: inherit;
  border-radius: ${p => p.borderRadius ?? '3px'};
  border-color: ${p => p.theme.general.border};
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  ${p => p.minimal ? css`
    padding: 4px;
    border-style: none;
  ` : css`
    padding: 2px;
    border-width: 2px;
    border-style: solid;
  `}

  &:focus,
  &.force-focus {
    outline: none;
    padding: ${p => p.minimal && '2px'};
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  &:disabled {
    border-color: ${p => p.theme.general.disabledBorder};
    color: ${p => p.theme.general.disabledFg};
  }

  &::placeholder {
    color: ${p => p.theme.defaultFg};
    opacity: 0.65;
  }

  &:disabled::placeholder {
    color: ${p => p.theme.general.disabledFg};
  }
`;
