import styled from 'styled-components';

import {CardGrid} from '../../ui';

export const RecentChangesList = styled(CardGrid).attrs({
  as: 'section',
})`
  grid-template-columns: 1fr;
  gap: 4px;

  @media (min-width: 960px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;
