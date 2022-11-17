import styled from 'styled-components';

export const Heading = styled.h1`
  margin-block: 8px;
  font-size: 44px;
  line-height: 48px;
  font-weight: 600;
`;

export const DetailsWrapper = styled.div.attrs({
  role: 'group',
})`
  margin-block: 16px;

  > p {
    margin-block: 0;
  }
`;

export const Details = styled.div<{
  $expanded: boolean;
}>`
  display: ${p => p.$expanded ? 'block' : 'none'};
  margin-top: 4px;
  padding: 6px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  border: 2px solid var(--border);
  border-radius: 3px;
  user-select: text;
`;
