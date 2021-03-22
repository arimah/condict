import styled from 'styled-components';

export type Props = {
  inline?: boolean;
  rows?: string;
  columns?: string;
  gap?: string;
  autoRows?: string;
  autoColumns?: string;
  autoFlow?: string;
  alignCellsX?: CellAlignment;
  alignCellsY?: CellAlignment;
  // Properties that allow the grid to be used as a cell.
  row?: number | string;
  column?: number | string;
  alignSelfX?: CellAlignment;
  alignSelfY?: CellAlignment;
};

const Grid = styled.div.attrs<Props>(p => ({
  style: {
    ...p.style,
    gridTemplateRows: p.rows,
    gridTemplateColumns: p.columns,
    gap: p.gap,
    gridAutoRows: p.autoRows,
    gridAutoColumns: p.autoColumns,
    gridAutoFlow: p.autoFlow,
    justifyItems: p.alignCellsX,
    alignItems: p.alignCellsY,
    gridRow: p.row,
    gridColumn: p.column,
    justifySelf: p.alignSelfX,
    alignSelf: p.alignSelfY,
  },
}))<Props>`
  display: ${p => p.inline ? 'inline-grid' : 'grid'};
`;

export default Grid;

export type CellProps = {
  row?: number | string;
  column?: number | string;
  alignX?: CellAlignment;
  alignY?: CellAlignment;
};

export type CellAlignment =
  | 'auto'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline';

export const Cell = styled.div.attrs<CellProps>(p => ({
  style: {
    ...p.style,
    gridRow: p.row,
    gridColumn: p.column,
    justifySelf: p.alignX,
    alignSelf: p.alignY,
  },
}))<CellProps>``;
