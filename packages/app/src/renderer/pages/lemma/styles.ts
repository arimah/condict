import styled from 'styled-components';

import {Link} from '../../ui';

export const DefinitionTools = styled.div`
  margin-block: -4px 4px;
  margin-inline-start: 8px;
  float: right;
`;

export const DefinitionLink = styled(Link)`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  padding-block: 5px;
  padding-inline: 14px 6px;
  min-height: 32px;
  border: 2px solid var(--border);
  border-radius: 7px;

  &:is(:focus, :focus-visible) {
    outline: none;
    border-radius: 7px;
    border-color: var(--focus-border);
    box-shadow: none;
  }

  > .mdi-icon {
    flex: none;
    margin-block: -4px;
    margin-inline-start: 8px;
  }
`;
