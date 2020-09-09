import {Table, Layout, Selection} from '../value';

export type MoveDelta =
  | 'first'
  | 'prev'
  | 'stay'
  | 'next'
  | 'last';

const navigate = (
  current: number,
  span: number,
  delta: MoveDelta,
  max: number
) => {
  switch (delta) {
    case 'first':
      return 0;
    case 'prev':
      return Math.max(current - 1, 0);
    case 'stay':
      return current;
    case 'next':
      return Math.min(current + span, max);
    case 'last':
      return max;
  }
};

const move = <D>(
  table: Table<D>,
  deltaRow: MoveDelta,
  deltaCol: MoveDelta,
  extendSelection = false
): Table<D> => Table.update(table, table => {
  const {layout, selection} = table;
  const focusedCell = Layout.getCellByKey(layout, selection.focus);
  const newRow = navigate(
    focusedCell.homeRow,
    focusedCell.rowSpan,
    deltaRow,
    layout.rowCount - 1
  );
  const newColumn = navigate(
    focusedCell.homeColumn,
    focusedCell.columnSpan,
    deltaCol,
    layout.columnCount - 1
  );

  const nextFocus = Layout.getCellAt(layout, newRow, newColumn).key;
  table.selection = Selection.moveFocus(selection, nextFocus, extendSelection);
});

export default move;
