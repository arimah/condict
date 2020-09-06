import styled, {StyledProps} from 'styled-components';

export type ScopeProps = {
  kind?: 'scope' | 'trap';
  active?: boolean | 'paused';
};

const getBorderColor = (props: StyledProps<ScopeProps>) => {
  if (props.kind === 'scope') {
    if (props.active === false) {
      return props.theme.general.disabledBorderColor;
    }
  } else if (props.kind === 'trap') {
    if (props.active === true) {
      return props.theme.primary.borderColor;
    } else if (props.active === 'paused') {
      return props.theme.primary.disabledBorderColor;
    }
  }
  return props.theme.general.borderColor;
};

export const Scope = styled.div<ScopeProps>`
  padding: 8px;
  border: 2px solid ${getBorderColor};
  border-radius: 3px;
  background-color: ${p => p.theme.general.bg};

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;

export const Container = styled.div`
  align-self: stretch;

  > section:first-child > h3:first-child {
    margin-top: 0;
  }
`;
