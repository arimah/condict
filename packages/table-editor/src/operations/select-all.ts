import {Table, Layout, Selection} from '../value';

const selectAll = <D>(
  table: Table<D>
): Table<D> => Table.update(table, table => {
  const {layout} = table;
  const firstCell = Layout.getCellAt(layout, 0, 0);
  const lastCell = Layout.getCellAt(
    layout,
    layout.rowCount - 1,
    layout.columnCount - 1
  );

  table.selection = Selection(lastCell.key, firstCell.key);
});

export default selectAll;
