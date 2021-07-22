import styled from 'styled-components';

import Link from '../link';

export const Main = styled(Link)`
  display: inline-block;
  padding-block: 6px;
  padding-inline: 10px 16px;
  border: 2px solid ${p => p.theme.general.bg};
  border-radius: 16px;
  background-color: ${p => p.theme.defaultBg};

  &:focus,
  &:focus-visible {
    border-radius: 16px;
    border-color: ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  > .mdi-icon {
    margin-block: -4px;
    margin-inline-end: 6px;
    vertical-align: -3px;
  }
`;
