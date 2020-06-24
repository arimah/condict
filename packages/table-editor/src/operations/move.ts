import {Table, Layout, Selection} from '../value';

export const enum MoveDelta {
  FIRST = -2,
  PREV = -1,
  NONE = 0,
  NEXT = 1,
  LAST = 2,
}

const navigate = (
  current: number,
  span: number,
  delta: MoveDelta,
  max: number
) => {
  switch (delta) {
    case MoveDelta.FIRST:
      return 0;
    case MoveDelta.PREV:
      return Math.max(current - 1, 0);
    case MoveDelta.NONE:
      return current;
    case MoveDelta.NEXT:
      return Math.min(current + span, max);
    case MoveDelta.LAST:
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
