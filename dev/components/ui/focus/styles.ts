import styled from 'styled-components';

import {Panel} from '../styles';

export const Scope = styled(Panel)<{
  $kind?: 'scope' | 'trap';
  $active?: boolean | 'paused';
}>`
  border-color: ${p => {
    if (p.$kind === 'scope') {
      if (p.$active === false) {
        return 'var(--border)';
      }
    } else if (p.$kind === 'trap') {
      if (p.$active === true) {
        return 'var(--border-accent)';
      } else if (p.$active === 'paused') {
        return 'var(--border)';
      }
    }
    return 'var(--border-control)';
  }};
`;

export const Container = styled.div`
  align-self: stretch;

  > section:first-child > h3:first-child {
    margin-top: 0;
  }
`;
