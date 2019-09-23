import {List} from 'immutable';

import genId from '@condict/gen-id';

import Value, {ValueData} from '../value';
import Layout from '../value/layout';
import Selection from '../value/selection';
import {Cell} from '../value/types';

const merge = <V extends Value<any>>(value: V) => {
  const {selection} = value;
  // If there's only a single cell (or none) selected, there's nothing to
  // merge, so we don't have to do anything!
  if (selection.size <= 1) {
    return value;
  }

  // When we merge cells, its location will be in the top-left corner of the
  // current selection. The cell's contents will be taken from the first cell
  // that is non-empty, starting at the top-left corner. Other properties are
  // also taken from that cell, e.g. header, inflected form stuff, etc.
  const topLeftCell = value.layout.cellFromPosition(
    selection.minRow,
    selection.minCol
  );

  const prototypeCell = value.findFirstNonEmptySelectedCell();
  const newCell = prototypeCell
    .set('key', genId())
    .set('rowSpan', selection.maxRow - selection.minRow + 1)
    .set('columnSpan', selection.maxCol - selection.minCol + 1);

  let newRows = value.rows.map(row =>
    row.update('cells', cells =>
      cells.filter(cell => !selection.isSelected(cell.key))
    )
  );
  newRows = newRows.updateIn(
    [topLeftCell.row, 'cells'],
    (cells: List<Cell<ValueData<V>>>) =>
      cells.insert(topLeftCell.colIndex, newCell)
  );
  const newLayout = new Layout(newRows);
  const newSelection = new Selection(newLayout, newCell.key);
  return value.make(newRows, newLayout, newSelection);
};

export default merge;
