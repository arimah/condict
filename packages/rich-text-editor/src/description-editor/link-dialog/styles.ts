import styled from 'styled-components';

export const Error = styled.div`
  margin: 8px;
  color: ${p => p.theme.danger.fg};
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

  ${p => p.selected && `
    background-color: ${p.theme.general.hoverAltBg};
  `}

  &:active {
    background-color: ${p => p.theme.general.activeAltBg};
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
  overflow: hidden;
`;

export const SearchResultType = styled.span`
  margin-left: 8px;
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
  font-style: italic;
  border-top: 1px solid ${p => p.theme.general.borderColor};
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
