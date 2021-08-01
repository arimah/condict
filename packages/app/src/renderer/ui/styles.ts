import styled from 'styled-components';

// General-purpose simple styled components.

export const FlowContent = styled.div`
  max-width: 800px;
`;

export const Selectable = styled.div`
  user-select: text;
`;

export const CardGrid = styled.div`
  display: grid;
  margin-block: 8px 16px;
  align-items: start;
  gap: 8px;
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;
