import {Table, Cell} from '../value';

const reduceSelected = <D, R>(
  table: Table<D>,
  initialValue: R,
  f: (acc: R, cell: Cell, data: D) => R
): R => {
  let result = initialValue;

  table.selectionShape.cells.forEach(key => {
    const cell = Table.getCell(table, key);
    const data = Table.getData(table, key);
    result = f(result, cell, data);
  });

  return result;
};

export default reduceSelected;
