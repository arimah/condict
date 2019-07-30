export const MOVE_FIRST = -2;
export const MOVE_PREV = -1;
export const MOVE_NONE = 0;
export const MOVE_NEXT = 1;
export const MOVE_LAST = 2;

const navigate = (current, span, delta, max) => {
  switch (delta) {
    case MOVE_FIRST:
      return 0;
    case MOVE_PREV:
      return Math.max(current - 1, 0);
    case MOVE_NONE:
      return current;
    case MOVE_NEXT:
      return Math.min(current + span, max);
    case MOVE_LAST:
      return max;
    default:
      throw new Error(`Invalid move offset: ${delta}`);
  }
};

export default (value, deltaRow, deltaCol, extendSelection = false) => {
  const {layout, selection: {focusedCellKey}} = value;
  const focusedCell = layout.cellFromKey(focusedCellKey);
  const newRow = navigate(
    focusedCell.row,
    focusedCell.rowSpan,
    deltaRow,
    layout.rowCount - 1
  );
  const newCol = navigate(
    focusedCell.col,
    focusedCell.columnSpan,
    deltaCol,
    layout.colCount - 1
  );

  const newFocusedCellKey = layout.cellFromPosition(newRow, newCol).key;
  return value.withFocusedCell(newFocusedCellKey, extendSelection);
};
