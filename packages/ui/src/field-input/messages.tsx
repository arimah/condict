import {ReactNode} from 'react';

export interface Messages {
  /**
   * "No matches for <i>$query</i>", shown when a user's search/filter query
   * does not match anything. The query is trimmed at both ends.
   */
  noResults(query: string): ReactNode;
  /**
   * "Check your spelling or try a different query", shown as an additional hint
   * when there are no search results for a query.
   */
  noResultsHelp(): string;
  /**
   * "Type to search for values", shown when there is no search query and the
   * input has either `knownValues` or `onSearch`. If there are no values at
   * all, `noValues()` is shown instead.
   */
  typeToSearch(): string;
  /**
   * "There are no values to select", shown when the input has neither
   * `knownValues` nor `onSearch`, in which case no values can possibly
   * be selected.
   */
  noValues(): string;
}

export const DefaultMessages: Messages = {
  noResults: query => <>No matches for <i>{query}</i></>,
  noResultsHelp: () => 'Check your spelling or try a different query',
  typeToSearch: () => 'Type to search for values',
  noValues: () => 'There are no values to select',
};
