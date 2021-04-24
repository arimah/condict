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
  margin-right: 8px;
  ${p => p.hasBase ? `
    margin-left: 46px;
    text-indent: -42px;
  ` : `margin-left: 4px;`}

  &:not(:first-child) {
    margin-top: ${p => p.hasBase ? '4px' : '8px'};
  }
`;

export const GroupName = styled.div`
  margin: 8px;
  font-weight: bold;
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
  font-size: 20px;
  line-height: 20px;
  cursor: default;

  background-color: ${p => p.theme.general[
    p.selected ? 'hoverAltBg' : 'altBg'
  ]};
  font-weight: ${p => p.isBase && 'bold'};

  &:active {
    background-color: ${p => p.theme.general.activeAltBg};
  }
`;

export type ResultProps = {
  selected: boolean;
};

export const Result = styled.div.attrs({
  role: 'option',
})<ResultProps>`
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

export const TargetIpa = styled.div`
  flex: 1 1 auto;
  padding: 4px 8px;
  font-size: 20px;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ConvertText = styled.div`
  flex: none;
  padding: 4px 8px 4px 0;
  white-space: nowrap;
  opacity: 0.7;
`;

export const SearchResultChar = styled.span`
  flex: none;
  margin-right: 8px;
  padding: 4px;
  min-width: 32px;
  text-align: center;
  font-size: 20px;
  line-height: 20px;
`;

export const SearchResultName = styled.span`
  flex: 1 1 auto;
`;

export const SecondaryTerms = styled.span`
  opacity: 0.7;
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
