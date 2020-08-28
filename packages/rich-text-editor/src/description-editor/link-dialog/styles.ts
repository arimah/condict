import styled from 'styled-components';

import {Button, TextInput, Intent} from '@condict/ui';

import Popup from '../popup';

export const Width = 375; // px

export const Main = styled(Popup).attrs({
  width: Width,
  role: 'dialog',
  tabIndex: -1,
})``;

export const InputWrapper = styled.div.attrs({
  role: 'combobox',
})`
  display: flex;
  margin: 2px;
  flex-direction: row;

  border-radius: 3px;
  border: 2px solid ${p => p.theme.general.bg};
  background-color: ${p => p.theme.general.bg};
`;

export const Input = styled(TextInput).attrs({
  size: 1,
  minimal: true,
})`
  flex: 1 1 auto;
  padding: 4px;
  min-width: 100px;
  border-radius: 3px 0 0 3px;

  &:focus {
    padding: 4px;
    border: none;
    box-shadow: none;
  }
`;

export const OkButton = styled(Button).attrs({
  intent: Intent.PRIMARY,
  bold: true,
  minimal: true,
  slim: true,
})`
  padding: 1px 12px;
  flex: none;
  border-radius: 3px;
`;

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
