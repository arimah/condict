import {List} from 'immutable';

import genId from '@condict/gen-id';

import {Row} from '../value';

export const convertStandardTable = (rows, convertCell) =>
  List(rows.map(row =>
    Row({
      key: genId(),
      cells: List(row.cells.map(cell =>
        convertCell(cell).set('key', genId())
      )),
    })
  ));
