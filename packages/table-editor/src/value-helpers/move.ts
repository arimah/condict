import Value from '../value';
import {LayoutCell} from '../value/types';

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

const move = <V extends Value<any>>(
  value: V,
  deltaRow: MoveDelta,
  deltaCol: MoveDelta,
  extendSelection = false
): V => {
  const {layout, selection: {focusedCellKey}} = value;
  const focusedCell = layout.cellFromKey(focusedCellKey) as LayoutCell;
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

export default move;
