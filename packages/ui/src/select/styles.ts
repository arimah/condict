import styled from 'styled-components';

export type Props = {
  minimal?: boolean;
};

export const Wrapper = styled.span`
  display: inline-flex;
  position: relative;
`;

export const Select = styled.select<Props>`
  appearance: none;
  padding-block: 1px;
  padding-inline: 6px 22px;
  width: 100%;
  font: inherit;
  border: 2px solid var(--select-border);
  border-radius: 3px;
  background-color: var(--select-bg);
  color: var(--select-fg);

  ${p => p.minimal && `
    --select-border: var(--select-minimal-border);
    --select-border-disabled: var(--select-minimal-border-disabled);
  `}

  &:hover {
    background-color: var(--select-bg-hover);
  }

  &:is(:focus, .force-focus) {
    outline: none;
    border-color: var(--focus-border);
  }

  &:disabled {
    border-color: var(--select-border-disabled);
    background-color: var(--select-bg-disabled);
    color: var(--select-fg-disabled);
  }
`;

export const Arrow = styled.svg.attrs({
  role: 'presentation',
  width: '8',
  height: '8',
})`
  display: block;
  position: absolute;
  top: 50%;
  inset-inline-end: 10px;
  color: var(--select-fg);
  pointer-events: none;
  transform: translate(0, -50%);

  *:disabled + & {
    color: var(--select-fg-disabled);
  }
`;
