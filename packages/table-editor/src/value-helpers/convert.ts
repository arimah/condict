import {List} from 'immutable';

import genId from '@condict/gen-id';

import {RowType} from '../value';
import {Cell} from '../value/types';

export type StandardRow<C> = {
  cells: C[];
};

export const convertStandardTable = <C, D>(
  rows: StandardRow<C>[],
  convertCell: (cell: C) => Cell<D>
) => {
  return List(rows.map(row =>
    RowType<D>({
      key: genId(),
      cells: List(row.cells.map(cell =>
        convertCell(cell).set('key', genId())
      )),
    })
  ));
};
