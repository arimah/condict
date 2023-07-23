export interface State<T> {
  /** Currently focused subcomponent. */
  focus: Focus;
  /** Search/filter input. */
  input: string;
  /** True if the dropdown is open. */
  dropdownOpen: boolean;
  /**
   * Currently focused search result index, or -1 if nothing is selected
   * (in which case the focus is in the input).
   */
  index: number;
  /** Current search results or null if there is no filter. */
  results: readonly T[] | null;
  /** True if the currently selected result should be scrolled into view. */
  showSelected: boolean;
}

export type Focus = 'input' | 'value' | false;

export type Message<T> =
  | {type: 'focus'; focus: Focus}
  | {type: 'blur'}
  | {type: 'input'; input: string}
  | {type: 'results'; results: readonly T[]}
  | {type: 'hoverSuggestion'; index: number}
  | {type: 'selectSuggestion'; index: number}
  | {type: 'showDropdown'}
  | {type: 'hideDropdown'};
