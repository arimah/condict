import {Draft} from 'immer';

import {Table, Cell} from '../value';

const mapSelected = <D>(
  table: Draft<Table<D>>,
  f: (cell: Draft<Cell>, data: Draft<D>) => void
): void => {
  for (const key of table.selectionShape.cells) {
    const cell = Table.getCell(table, key);
    Table.updateData(table, key, data => f(cell, data));
  }
};

export default mapSelected;
