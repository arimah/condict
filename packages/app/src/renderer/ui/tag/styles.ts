import styled from 'styled-components';

import Link from '../link';

export const Tag = styled(Link)`
  box-sizing: border-box;
  display: inline-flex;
  padding-block: 5px;
  padding-inline: 10px 16px;
  flex-direction: row;
  align-items: center;
  min-height: 32px;
  border: 2px solid var(--border);
  border-radius: 24px;
  background-color: var(--bg);

  &:is(:focus, :focus-visible) {
    border-radius: 32px;
    border-color: var(--focus-border);
    border-style: var(--focus-border-style);
    box-shadow: var(--focus-shadow);
  }

  > .mdi-icon {
    flex: none;
    margin-block: -4px;
    margin-inline-end: 6px;
  }
`;

export const TagList = styled.ul`
  display: flex;
  padding: 0;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  list-style-type: none;

  > li {
    margin: 0;
  }
`;
