import {Table, Cell, Layout, Selection} from '../value';

const merge = <D>(table: Table<D>): Table<D> => {
  // If there's only a single cell (or none) selected, there's nothing to
  // merge, so we don't have to do anything!
  if (table.selectionShape.cells.size === 1) {
    return table;
  }

  return Table.update(table, table => {
    const {selectionShape: sel, layout, rows} = table;

    // When we merge cells, the new cell's location will be in the top-left
    // corner of the current selection. The cell's contents will be taken from
    // the first cell that is non-empty, starting at the top-left corner. Other
    // properties are also taken from that cell, e.g. header, data, etc.
    const topLeftCell = Layout.getCellAt(layout, sel.minRow, sel.minColumn);

    const prototypeCell = Table.findFirstNonEmptyCell(table);
    // Retain the prototype cell key so we don't have to move the cell data.
    const newCell: Cell = {
      ...prototypeCell,
      rowSpan: sel.maxRow - sel.minRow + 1,
      columnSpan: sel.maxColumn - sel.minColumn + 1,
    };

    // Remove all selected cells. The new cell will be inserted further down.
    for (let r = sel.minRow; r <= sel.maxRow; r++) {
      const row = rows[r];
      row.cells = row.cells.filter(k => !sel.cells.has(k));
    }

    sel.cells.forEach(key => {
      if (key !== newCell.key) {
        table.cells.delete(key);
        table.cellData.delete(key);
      }
    });

    // Insert the new cell. Note the previous cell has been removed from
    // the table altogether.
    table.cells.set(newCell.key, newCell);
    rows[topLeftCell.homeRow].cells.splice(
      topLeftCell.indexInRow,
      0,
      newCell.key
    );

    table.selection = Selection(newCell.key);
  });
};

export default merge;
