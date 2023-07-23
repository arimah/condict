import styled from 'styled-components';

import {DeleteIcon} from './icons';

// The minimum height reserved for the dropdown when determining whether to
// place it above or below the input. Even if the dropdown is smaller than
// this, we will use this minimum height to reduce "flip-flopping" between
// the two placements. Otherwise a dropdown that is currently above could
// suddenly fit below the input when a bit of filter text has been typed,
// which might be distracting or confusing to the user.
export const DropdownPlacementMinHeight = 180; // px

export const Main = styled.div<{
  $minimal?: boolean;
  $disabled?: boolean;
  $inputFocused: boolean;
}>`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 2px;
  gap: 2px;
  position: relative;
  border-radius: 3px;
  border: 2px solid var(${p =>
    p.$disabled ? '--input-border-disabled' :
    p.$inputFocused ? '--focus-border' :
    '--input-border'
  });
  background-color: var(${p => p.$disabled
    ? '--input-bg-disabled'
    : '--input-bg'
  });
  color: var(${p => p.$disabled
    ? '--input-fg-disabled'
    : '--input-fg'
  });
  cursor: ${p => !p.$disabled && 'text'};

  ${p => p.$minimal && `
    --input-border: var(--input-minimal-border);
    --input-border-disabled: var(--input-minimal-border);
  `}
`;

export const Value = styled.button.attrs({
  type: 'button',
  tabIndex: -1,
})`
  box-sizing: border-box;
  flex: none;
  padding-block: 0;
  padding-inline: 10px 24px;
  position: relative;
  max-width: calc(100% - 4px);
  min-height: 22px;
  font: inherit;
  text-align: start;
  background-color: var(--button-bg);
  border: 2px solid var(--button-border);
  border-radius: 3px;
  color: var(--button-fg);
  cursor: default;

  &:hover {
    background-color: var(--button-bg-hover);
    border-color: var(--button-border-hover);
  }

  &:active {
    background-color: var(--button-bg-pressed);
    border-color: var(--button-border-pressed);
  }

  &:disabled {
    padding-inline: 17px;
    background-color: var(--button-bg-disabled);
    border-color: var(--button-border-disabled);
    color: var(--button-fg-disabled);
  }

  &:is(:focus, .force-focus) {
    outline: none;
    border-color: var(--focus-border);
    box-shadow: inset 0 0 0 1px var(--input-bg);
  }
`;

export const DeleteMarker = styled(DeleteIcon)`
  position: absolute;
  inset-inline-end: 8px;
  top: 50%;
  margin-top: -4px;
  pointer-events: none;
  opacity: 0.25;

  ${Value}:is(:hover, :active) & {
    opacity: 0.8;
  }
`;

export const Input = styled.input.attrs({
  type: 'text',
  size: 1,
  role: 'combobox',
})`
  box-sizing: border-box;
  flex: 1 1 auto;
  margin: -2px;
  padding: 4px;
  min-width: 128px;
  min-height: 26px;
  font: inherit;
  border: none;
  border-radius: 0;
  background-color: transparent;
  color: var(--input-fg);

  &:focus {
    outline: none;
  }

  &:disabled {
    color: var(--input-fg-disabled);
  }
`;

// Note: sized and positioned by JavaScript
export const Dropdown = styled.div.attrs({
  tabIndex: -1,
})<{
  $visible: boolean;
}>`
  display: ${p => p.$visible ? 'block' : 'none'};
  box-sizing: border-box;
  position: fixed;
  z-index: 10;
  /* deliberately does not fit an integer number of items - makes it
   * more obvious that there is overflow */
  max-height: 18.5rem;
  overflow: auto;

  border: 2px solid var(--border-control);
  border-radius: 3px;
  background-color: var(--bg-control);
  color: var(--fg-control);
  box-shadow: var(--shadow-elevation-2);

  cursor: default;

  &:focus {
    outline: none;
  }
`;

export const SuggestionList = styled.ul.attrs({
  role: 'listbox',
})`
  list-style-type: none;
  margin: 0;
  padding: 0;

  &:empty {
    display: none;
  }
`;

export const Suggestion = styled.li.attrs({
  role: 'option',
})<{
  $focused: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  padding: 8px;
  gap: 8px;
  white-space: nowrap;
  background-color: ${p => p.$focused && 'var(--bg-control-hover)'};
`;

export const ItemMarker = styled.span<{
  $single: boolean;
  $selected: boolean;
}>`
  box-sizing: border-box;
  flex: none;
  width: 16px;
  height: 16px;
  position: relative;
  border: 2px solid;

  &::before {
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
  }

  ${p => p.$single ? `
    border-color: var(${p.$selected
      ? '--radio-border-checked'
      : '--radio-border'
    });
    border-radius: 9px;
    background-color: var(${p.$selected
      ? '--radio-bg-checked'
      : '--radio-bg'
    });
    color: var(--radio-fg);

    ${p.$selected && `
      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: currentColor;
        transform: translate(-50%, -50%);
      }
    `}
  ` : `
    border-color: var(${p.$selected
      ? '--checkbox-border-checked'
      : '--checkbox-border'
    });
    border-radius: 3px;
    background-color: var(${p.$selected
      ? '--checkbox-bg-checked'
      : '--checkbox-bg'
    });
    color: var(--checkbox-fg);

    ${p.$selected && `
      &::before {
        content: '';
        width: 10px;
        height: 6px;
        border-left: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: translate(-50%, -75%) rotate(-45deg);
      }
    `}
  `}
`;

export const ItemName = styled.span`
  flex: 1 1 auto;
  text-overflow: ellipsis;
  overflow: hidden;

  &:not(:last-child) {
    flex-grow: 0;
  }
`;

export const ItemTag = styled.span`
  flex: 1 1 auto;
  margin-inline-start: 8px;
  opacity: 0.7;
`;

export const Hint = styled.div<{
  $noResults: boolean;
}>`
  display: flex;
  flex-direction: ${p => p.$noResults ? 'column' : 'row'};
  align-items: ${p => p.$noResults ? 'stretch' : 'center'};
  gap: 8px;
  padding: 8px;

  &:empty {
    display: none;
  }

  > .mdi-icon {
    flex: none;
    margin: -4px;
  }
`;

export const NoResults = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
`;
