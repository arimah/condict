import {Table} from '../value';

import mapSelected from './map-selected';

const toggleHeader = <D>(table: Table<D>): Table<D> => {
  const focusedCell = Table.getCell(table, table.selection.focus);
  const header = !focusedCell.header;
  return Table.update(table, table => {
    mapSelected(table, cell => {
      cell.header = header;
    });
  });
};

export default toggleHeader;
