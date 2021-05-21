import styled, {css} from 'styled-components';

export type Props = {
  borderRadius?: number;
  minimal?: boolean;
};

export const Wrapper = styled.span`
  display: inline-block;
  position: relative;
`;

export const Select = styled.select<Props>`
  appearance: none;
  font: inherit;
  border-radius: ${p => p.borderRadius || '3px'};
  border-color: ${p => p.theme.general.border};
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  ${p => p.minimal ? css`
    padding: 4px 24px 4px 8px;
    border-style: none;
  ` : css`
    padding: 2px 22px 2px 6px;
    border-width: 2px;
    border-style: solid;
  `}

  &:hover {
    background-color: ${p => p.theme.defaultHoverBg};
  }

  &:focus,
  &.force-focus {
    outline: none;
    padding: ${p => p.minimal && '2px 22px 2px 6px'};
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  &:disabled {
    border-color: ${p => p.theme.general.disabledBorder};
    background-color: ${p => p.theme.defaultBg};
    color: ${p => p.theme.general.disabledFg};
  }
`;

export type DisabledProps = {
  disabled?: boolean;
};

export const Arrow = styled.svg.attrs({
  role: 'presentation',
  width: '8',
  height: '8',
})<DisabledProps>`
  display: block;
  position: absolute;
  top: 50%;
  right: 10px;
  pointer-events: none;
  transform: translate(0, -50%);

  color: ${p => p.disabled ? p.theme.general.disabledBorder : p.theme.defaultFg};
`;
