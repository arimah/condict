import styled, {StyledProps} from 'styled-components';

import {Panel} from '../styles';

export type ScopeProps = {
  kind?: 'scope' | 'trap';
  active?: boolean | 'paused';
};

const getBorderColor = (props: StyledProps<ScopeProps>) => {
  if (props.kind === 'scope') {
    if (props.active === false) {
      return props.theme.general.disabledBorder;
    }
  } else if (props.kind === 'trap') {
    if (props.active === true) {
      return props.theme.accent.border;
    } else if (props.active === 'paused') {
      return props.theme.accent.disabledBorder;
    }
  }
  return props.theme.general.border;
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
