import styled from 'styled-components';

export const Panel = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;

  padding: 14px;
  border: 2px solid var(--border);

  border-radius: 7px;

  &:is(:focus, .force-focus) {
    outline: none;
    padding: 14px;
    border-color: var(--focus-border);
  }

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;
