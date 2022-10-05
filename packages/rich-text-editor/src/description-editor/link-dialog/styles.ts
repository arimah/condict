import styled from 'styled-components';

import {Spinner as SpinnerBase} from '@condict/ui';

export const Spinner = styled(SpinnerBase).attrs({
  size: 20,
})`
  display: block;
  margin-inline-end: 4px;
  flex: none;
  align-self: center;
`;

export const Error = styled.div`
  margin: 8px;
  color: var(--fg-danger);
`;

export type SearchResultProps = {
  selected: boolean;
};

export const SearchResult = styled.li.attrs({
  role: 'option',
})<SearchResultProps>`
  margin: 0;
  padding: 8px;
  user-select: none;

  background-color: ${p => p.selected && 'var(--bg-control-hover)'};

  &:active {
    background-color: var(--bg-control-pressed);
  }
`;

export const SearchResultHeader = styled.div`
  display: flex;
  flex-direction: row;
`;

export const SearchResultName = styled.span`
  flex: 1 1 auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
  overflow: hidden;
`;

export const SearchResultType = styled.span`
  margin-inline-start: 8px;
  flex: none;
  max-width: 175px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  opacity: 0.7;
`;

export const SearchResultMatch = styled.div`
  margin-top: 2px;
  padding-top: 2px;
  font-size: var(--font-size-mb);
  line-height: var(--line-height-mb);
  border-top: 1px solid var(--border-control);

  /* Tighter spacing around paragraphs for better coherence */
  > p {
    margin-block: 4px;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export type SearchResultListProps = {
  hasResults: boolean;
};

export const SearchResultList = styled.ul.attrs({
  role: 'listbox',
})<SearchResultListProps>`
  display: ${p => p.hasResults ? 'block' : 'none'};
  margin: 2px 0 0;
  padding: 0;
  list-style-type: none;
  max-height: 200px;
  overflow: auto;
`;
