import {Table, Cell} from '../../value';
import {mapSelected} from '../../operations';

import {InflectionTable} from '../types';

const toggleDeriveLemma = (table: InflectionTable): InflectionTable => {
  // The deriveLemma setting is not applicable to header cells. If the focus
  // is on a header cell, use the first data cell as the setting source. If
  // no data cells are selected, this is a no-op.
  let candidateCell: Cell | null = Table.getCell(table, table.selection.focus);
  if (candidateCell.header) {
    candidateCell = Table.findFirstSelectedCell(table, cell => !cell.header);
  }
  if (!candidateCell) {
    return table;
  }

  const nextDeriveLemma = !Table.getData(table, candidateCell.key).deriveLemma;
  return Table.update(table, table =>
    mapSelected(table, (_cell, data) => {
      data.deriveLemma = nextDeriveLemma;
    })
  );
};

export default toggleDeriveLemma;
