import styled from 'styled-components';
import {theme} from 'styled-tools';

import {LightTheme} from '@condict/ui';

export const SearchResult = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: default;

  background-color: ${theme('general.altBg')};

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &:hover {
    background-color: ${theme('general.hoverAltBg')};
  }
`;

SearchResult.defaultProps = {
  theme: LightTheme,
};

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
