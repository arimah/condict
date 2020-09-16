import styled from 'styled-components';

export const CharacterList = styled.div.attrs({
  role: 'listbox',
})`
  max-height: 260px;
  overflow: auto;
`;

export type GroupProps = {
  hasBase: boolean;
};

export const Group = styled.div<GroupProps>`
  ${p => p.hasBase && `
    margin-left: 42px;
    text-indent: -42px;
  `}

  &:not(:first-child) {
    margin-top: ${p => p.hasBase ? '4px' : '8px'};
  }
`;

export const GroupName = styled.div`
  margin-left: 2px;
  margin-right: 2px;
  font-weight: bold;
  font-size: 11pt;
`;

export type CharacterProps = {
  isBase: boolean;
  selected: boolean;
};

export const Character = styled.span.attrs({
  role: 'option',
})<CharacterProps>`
  display: inline-block;
  margin-right: 2px;
  margin-bottom: 2px;
  padding: 4px;
  min-width: 32px;
  text-indent: 0;
  text-align: center;
  font-size: 17pt;
  cursor: default;

  background-color: ${p => p.theme.general[
    p.selected ? 'hoverAltBg' : 'altBg'
  ]};
  font-weight: ${p => p.isBase && 'bold'};

  &:active {
    background-color: ${p => p.theme.general.activeAltBg};
  }
`;

export type SearchResultProps = {
  selected: boolean;
};

export const SearchResult = styled.div.attrs({
  role: 'option',
})<SearchResultProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: default;

  background-color: ${p => p.theme.general[
    p.selected ? 'hoverAltBg' : 'altBg'
  ]};

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &:active {
    background-color: ${p => p.theme.general.activeAltBg};
  }
`;

export const SearchResultChar = styled.span`
  flex: none;
  margin-right: 8px;
  padding: 4px;
  min-width: 32px;
  text-align: center;
  font-size: 17pt;
`;

export const SearchResultName = styled.span`
  flex: 1 1 auto;
`;

export const SecondaryTerms = styled.span`
  opacity: 0.65;
`;

export const NoSearchResults = styled.div`
  margin: 24px;
  font-weight: bold;
  text-align: center;
`;

export const NoResultsSuggestion = styled.div`
  margin: 8px;
`;

export const Match = 'b';
