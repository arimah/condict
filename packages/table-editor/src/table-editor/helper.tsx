import {SROnly} from '@condict/ui';

import {Table} from '../value';
import {useEditor} from '../context';
import {Messages} from '../types';

export type Props<D, M extends Messages> = {
  tableId: string;
  table: Table<D>;
  messages: M;
};

function TableHelper<D, M extends Messages>(props: Props<D, M>): JSX.Element {
  const {tableId, table, messages} = props;
  const {selectionShape: sel} = table;

  const editor = useEditor<D, M>();

  const cell = Table.getCell(table, sel.focus);
  const data = Table.getData(table, sel.focus);

  return (
    <SROnly id={`${tableId}-cellHint`}>
      {sel.cells.size > 1 ? messages.describeSelection(sel) : ''}
      {cell && editor.describeCell(messages, cell, data)}
    </SROnly>
  );
}

export default TableHelper;
