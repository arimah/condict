import styled from 'styled-components';

import Link from '../link';

export const Main = styled(Link)`
  display: inline-block;
  padding-block: 6px;
  padding-inline: 10px 16px;
  border: 2px solid var(--border);
  border-radius: 16px;
  background-color: var(--bg);

  &:is(:focus, :focus-visible) {
    border-radius: 16px;
    border-color: var(--focus-border);
    border-style: var(--focus-border-style);
    box-shadow: var(--focus-shadow);
  }

  > .mdi-icon {
    margin-block: -4px;
    margin-inline-end: 6px;
    vertical-align: -3px;
  }
`;
