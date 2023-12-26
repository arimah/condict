import styled, {css} from 'styled-components';

export type ButtonIntent =
  | 'general'
  | 'accent'
  | 'bold'
  | 'danger'
  | 'naked';

export const ButtonStyle = css<{
  $slim: boolean;
  $intent: ButtonIntent;
}>`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: ${p => p.$slim ? '1px 10px' : '5px 14px'};
  min-height: ${p => p.$slim ? '24px' : 'max(32px, var(--line-height-md) + 14px)'};
  font: inherit;
  font-weight: normal;
  border: 2px solid;
  border-radius: ${p => p.$slim ? '3px' : '7px'};

  /* fix button baseline when first element is an icon */
  vertical-align: middle;

  color: var(--button-fg);
  border-color: var(--button-border);
  background-color: var(--button-bg);

  ${p => p.$intent !== 'general' && `
    --button-fg: var(--button-${p.$intent}-fg);
    --button-fg-disabled: var(--button-${p.$intent}-fg-disabled);

    --button-bg: var(--button-${p.$intent}-bg);
    --button-bg-hover: var(--button-${p.$intent}-bg-hover);
    --button-bg-pressed: var(--button-${p.$intent}-bg-pressed);
    --button-bg-disabled: var(--button-${p.$intent}-bg-disabled);

    --button-border: var(--button-${p.$intent}-border);
    --button-border-hover: var(--button-${p.$intent}-border-hover);
    --button-border-pressed: var(--button-${p.$intent}-border-pressed);
    --button-border-disabled: var(--button-${p.$intent}-border-disabled);
  `}

  &:hover {
    background-color: var(--button-bg-hover);
    border-color: var(--button-border-hover);
  }

  &:is(:active, .force-active) {
    background-color: var(--button-bg-pressed);
    border-color: var(--button-border-pressed);
  }

  &:disabled {
    color: var(--button-fg-disabled);
    border-color: var(--button-border-disabled);
    background-color: var(--button-bg-disabled);
  }

  &:is(:focus, .force-focus) {
    outline: none;
    border-color: var(--focus-border);
    box-shadow: inset 0 0 0 1px var(--bg);
  }

  > .mdi-icon {
    flex: none;
    margin-block: -4px;
  }

  > .mdi-icon:first-child {
    margin-inline-start: -8px;
  }

  > .mdi-icon:not(:first-child) {
    margin-inline-start: 8px;
  }

  > .mdi-icon:last-child {
    margin-inline-end: -8px;
  }

  > .mdi-icon:not(:last-child) {
    margin-inline-end: 8px;
  }
`;

export const Button = styled.button<{
  $slim: boolean;
  $intent: ButtonIntent;
}>`
  ${ButtonStyle}
`;

export const Link = styled.a<{
  $slim: boolean;
  $intent: ButtonIntent;
}>`
  /* We have to do some extra work to override link styles :( */
  &:link,
  &:hover,
  &:active,
  &:visited {
    color: var(--button-fg);
    text-decoration: none;
  }

  ${ButtonStyle}
`;
