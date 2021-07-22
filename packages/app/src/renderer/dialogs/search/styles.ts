import styled from 'styled-components';

import {TextInput, Spinner as SpinnerBase} from '@condict/ui';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 680px;
  max-width: 75vw;
  height: 520px;
  max-height: 75vh;
  pointer-events: none;
`;

export const Main = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
})`
  box-sizing: border-box;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  padding: 24px;
  max-height: 100%;
  border-radius: 15px;
  background-color: ${p => p.theme.general.bg};
  box-shadow:
    0 2px 7px rgba(0, 0, 0, ${p => p.theme.mode === 'dark' ? '0.8' : '0.6'});
  pointer-events: all;

  &:focus {
    outline: none;
  }
`;

export const InputWrapper = styled.label`
  flex: none;
  display: flex;
  flex-direction: row;
  border-radius: 7px;
  border: 2px solid ${p => p.theme.defaultBg};
  background-color: ${p => p.theme.defaultBg};
  cursor: text;

  &:focus-within {
    border-color: ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  > .mdi-icon {
    flex: none;
    display: block;
    margin-block: 6px;
    margin-inline: 6px 0;
    align-self: center;
  }
`;

export const Input = styled(TextInput).attrs({
  type: 'search',
  minimal: true,
})`
  flex: 1 1 auto;
  align-self: stretch;
  padding-block: 4px;
  padding-inline: 8px 4px;
  border: none;
  border-radius: 0;
  border-start-end-radius: 5px;
  border-end-end-radius: 5px;

  &:focus {
    padding-block: 4px;
    padding-inline: 8px 4px;
    border: none;
    box-shadow: none;
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    display: none;
  }
`;

export const Spinner = styled(SpinnerBase).attrs({
  size: 20,
})`
  align-self: center;
  margin-block: 6px;
  margin-inline: 4px 6px;
`;

export const SearchOptions = styled.p`
  display: flex;
  flex-direction: row;
  /* Bottom margin matches slim button bottom padding. Without this, the text
   * ends up too far from the bottom of the dialog.
   */
  margin: 8px 0 -4px;
  gap: 24px;
  align-items: center;
`;

export const SearchScopes = styled.span.attrs({
  role: 'group',
})`
  display: flex;
  flex: none;
  flex-direction: row;
  gap: 16px;

  > * {
    flex: none;
  }
`;

export const AdvancedSearch = styled.span`
  flex: 1 1 auto;
  text-align: end;
`;

export const ResultList = styled.ul`
  flex: 0 1 auto;
  list-style-type: none;
  margin-block: 16px 0;
  margin-inline: 0 -16px;
  padding-block: 0;
  padding-inline: 0 2px;
  overflow-x: hidden;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: 8px;
    border-radius: 4px;
    background-color: ${p => p.theme.general.bg};
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: ${p => p.theme.general.activeBg};
  }
`;

export type ResultProps = {
  $selected: boolean;
};

export const Result = styled.li<ResultProps>`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  margin: 0;
  padding: 8px;
  border-radius: 3px;
  background-color: ${p => p.$selected && p.theme.general.hoverBg};

  &:active {
    background-color: ${p => p.theme.general.activeBg};
  }

  > .mdi-icon {
    grid-column: 1;
    grid-row: 1 / span 2;
    margin-inline-end: 8px;
  }
`;

export const ResultHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  grid-column: 2;
  grid-row: 1;
`;

export const ResultName = styled.span`
  flex: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 18px;
  line-height: 20px;
`;

export const ResultLanguage = styled.span`
  flex: 1 1 auto;
  margin-inline: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ResultType = styled.span`
  flex: none;
  margin-inline-start: 8px;
  max-width: 176px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  opacity: 0.7;
`;

export const ResultBody = styled.div`
  grid-column: 2;
  grid-row: 2;
  margin-top: 2px;
  padding-top: 4px;
  white-space: pre-wrap;
  border-top: 1px solid ${p => p.theme.general.border};
`;

export const Ellipsis = styled.span`
  opacity: 0.7;
`;

export const Highlight = styled.b`
  color: ${p => p.theme.accent.defaultFg};
`;

export const ResultText = styled.div`
  margin-top: 16px;

  > p:last-child {
    margin-bottom: 0;
  }
`;

export const NoResultNotice = styled.p`
  margin-bottom: 16px;
  text-align: center;
  font-size: 18px;
  line-height: 20px;
`;
