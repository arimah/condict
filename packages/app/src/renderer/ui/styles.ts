import styled from 'styled-components';

import {Button} from '@condict/ui';

// General-purpose simple styled components.

export const MainHeader = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
  gap: 16px;

  && > h1 {
    flex: 1 1 auto;
    margin-block: 0;
  }
`;

export const HeaderAction = styled(Button)`
  flex: none;
  align-self: flex-start;
  min-width: 96px;
`;

export const Subheader = styled.p`
  margin-block: -8px 12px;
`;

export const FlowContent = styled.div`
  max-width: 800px;
`;

export const Selectable = styled.div`
  user-select: text;
`;

export const CardList = styled.div`
  margin-block: 8px 16px;

  > :not(:last-child) {
    margin-bottom: 8px;
  }
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

export const Secondary = styled.span`
  opacity: 0.7;
`;
