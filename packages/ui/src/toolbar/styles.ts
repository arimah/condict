import styled from 'styled-components';

export const Toolbar = styled.div.attrs({
  role: 'toolbar',
})`
  display: flex;
  flex-direction: row;
  padding: 2px;
  flex-wrap: wrap;
  border-radius: 5px;
  background-color: var(--toolbar-bg);
  color: var(--toolbar-fg);
`;

export const Group = styled.div.attrs({
  role: 'group' as string | undefined,
})`
  display: flex;
  flex: none;
  flex-direction: row;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-inline-end: 16px;
  }
`;

export const Button = styled.button.attrs({
  type: 'button',
})<{
  $checked?: boolean;
}>`
  flex: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  min-height: 28px;
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: none;
  border-radius: 4px;
  background-color: var(--toolbar-item-bg);
  color: var(--toolbar-item-fg);

  &:not(:first-child) {
    margin-inline-start: 2px;
  }

  &:hover {
    background-color: var(--toolbar-item-bg-hover);
  }

  &:is(:active, .menu-open) {
    background-color: var(--toolbar-item-bg-pressed);;
  }

  &:is(:focus, .force-focus) {
    outline: none;
    padding: 3px 6px;
    border: 2px solid var(--focus-border);
  }

  ${p => p.$checked && `
    && {
      background-color: var(--toolbar-item-bg-selected);
      color: var(--toolbar-item-fg-selected);
      box-shadow: var(--toolbar-item-shadow-selected);
    }
  `}

  &:disabled {
    background-color: var(--toolbar-item-bg-disabled);
    color: var(--toolbar-item-fg-disabled);
  }

  > .mdi-icon {
    flex: none;
    margin-block: -4px;

    &:first-child {
      margin-inline-start: -4px;
    }
    &:last-child {
      margin-inline-end: -4px;
    }
  }
`;

export const Spacer = styled.div`
  flex: 1 0 auto;
`;

export const SelectLabel = styled.label`
  flex: none;
  align-self: center;
`;
