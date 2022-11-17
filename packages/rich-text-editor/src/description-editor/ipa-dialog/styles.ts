import styled from 'styled-components';

export const CharacterList = styled.div.attrs({
  role: 'listbox',
})`
  max-height: 260px;
  overflow: auto;
`;

export const Group = styled.div<{
  $hasBase: boolean;
}>`
  margin-inline-end: 8px;
  ${p => p.$hasBase ? `
    margin-inline-start: 46px;
    text-indent: -42px;
  ` : `
    margin-inline-start: 4px;
  `}

  &:not(:first-child) {
    margin-top: ${p => p.$hasBase ? '4px' : '8px'};
  }
`;

export const GroupName = styled.div`
  margin: 8px;
  font-weight: bold;
`;

export const Character = styled.span.attrs({
  role: 'option',
})<{
  $isBase: boolean;
  $selected: boolean;
}>`
  display: inline-block;
  margin-bottom: 2px;
  margin-inline-end: 2px;
  padding: 4px;
  min-width: 32px;
  text-indent: 0;
  text-align: center;
  font-size: var(--font-size-xxl);
  line-height: var(--line-height-xxl);
  cursor: default;

  background-color: ${p => p.$selected && 'var(--bg-control-hover)'};
  font-weight: ${p => p.$isBase && 'bold'};

  &:active {
    background-color: var(--bg-control-pressed);
  }
`;

export const Result = styled.div.attrs({
  role: 'option',
})<{
  $selected: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: default;

  background-color: var(${p => p.$selected
    ? '--bg-control-hover'
    : '--bg-control'
  });

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &:active {
    background-color: var(--bg-control-pressed);
  }
`;

export const TargetIpa = styled.div`
  flex: 1 1 auto;
  padding: 4px 8px;
  font-size: var(--font-size-xxl);
  line-height: var(--line-height-xxl);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ConvertText = styled.div`
  flex: none;
  padding-block: 4px;
  padding-inline: 0 8px;
  white-space: nowrap;
  opacity: 0.7;
`;

export const SearchResultChar = styled.span`
  flex: none;
  margin-inline-end: 8px;
  padding: 4px;
  min-width: 32px;
  text-align: center;
  font-size: var(--font-size-xxl);
  line-height: var(--line-height-xxl);
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
