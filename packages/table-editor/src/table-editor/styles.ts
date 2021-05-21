import styled from 'styled-components';

export const TableWrapper = 'div';

export const Table = styled.table.attrs({
  role: 'grid',
})`
  border-collapse: collapse;
  border: 1px solid ${p => p.theme.general.border};

  &:focus {
    /* The table manages its own internal focus. */
    outline: none;
  }
`;

export type HelperProps = {
  disabled: boolean;
};

export const Helper = styled.div<HelperProps>`
  margin-top: 8px;
  color: ${p => p.disabled ? p.theme.general.disabledFg : p.theme.defaultFg};
`;
