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
