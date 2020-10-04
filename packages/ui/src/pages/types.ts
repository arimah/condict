import React from 'react';

export interface PageContextValue {
  totalPages: number;
  loading: boolean;
  disabled: boolean;
  messages: Messages;
  onChange: (page: number) => void;
}

export const PageContext = React.createContext<PageContextValue>({
  totalPages: 0,
  loading: false,
  disabled: false,
  get messages(): Messages {
    throw new Error('Context not provided');
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: () => {},
});

export interface Messages {
  /** "Previous page" - SR label for the '<' button. */
  prevPage(): string;
  /** "Next Page" - SR label for the '>' button. */
  nextPage(): string;
  /**
   * "Pages START to END omitted" - SR-only helper text for the ellipsis ('...')
   * shown when pages are omitted, as in:
   *
   *   <  1  2  …  5  6  7  …  12  13  >
   *            ^ this      ^ and this
   *
   * This function is only called when at least two pages are omitted. If only
   * one page would be omitted, a regular page button is always drawn.
   * @param start The 1-based index of the first omitted page.
   * @param end The (inclusive) 1-based index of the last omitted page.
   */
  pagesOmitted(start: number, end: number): string;
  /**
   * "Page N of COUNT", SR-only label for page buttons.
   * @param n The 1-based page number.
   * @param count The total number of pages.
   */
  pageNumber(n: number, count: number): string;
}
