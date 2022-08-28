import styled, {StyledProps} from 'styled-components';

import {Panel} from '../styles';

export type ScopeProps = {
  kind?: 'scope' | 'trap';
  active?: boolean | 'paused';
};

const getBorderColor = (props: StyledProps<ScopeProps>) => {
  if (props.kind === 'scope') {
    if (props.active === false) {
      return 'var(--border)';
    }
  } else if (props.kind === 'trap') {
    if (props.active === true) {
      return 'var(--border-accent)';
    } else if (props.active === 'paused') {
      return 'var(--border)';
    }
  }
  return 'var(--border-control)';
};

export const Scope = styled(Panel)<ScopeProps>`
  border-color: ${getBorderColor};
`;

export const Container = styled.div`
  align-self: stretch;

  > section:first-child > h3:first-child {
    margin-top: 0;
  }
`;
