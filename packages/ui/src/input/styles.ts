import styled from 'styled-components';

export type Props = {
  minimal: boolean;
};

export const Input = styled.input<Props>`
  box-sizing: border-box;
  padding: 1px 2px;
  min-height: 24px;
  font: inherit;
  border: 2px solid var(--input-border);
  border-radius: 3px;
  background-color: var(--input-bg);
  color: var(--input-fg);

  ${p => p.minimal && `
    --input-border: var(--input-minimal-border);
    --input-border-disabled: var(--input-minimal-border-disabled);
  `}

  &:is(:focus, .force-focus) {
    outline: none;
    border-color: var(--focus-border);
    border-style: var(--focus-border-style);
    box-shadow: var(--focus-shadow);
  }

  &:disabled {
    border-color: var(--input-border-disabled);
    background-color: var(--input-bg-disabled);
    color: var(--input-fg-disabled);
  }

  &::placeholder {
    color: var(--input-fg);
    opacity: 0.65;
  }

  &:disabled::placeholder {
    color: var(--input-fg-disabled);
  }
`;
