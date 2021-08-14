import styled from 'styled-components';

import {CardGrid} from '../../ui';

export const RecentChangesList = styled(CardGrid).attrs({
  as: 'section',
})`
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;
