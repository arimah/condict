import {ReactNode} from 'react';

import {Menu} from '@condict/ui';

import {Table} from '../value';
import {useEditor} from '../context';
import {Messages} from '../types';

export type Props<D, M extends Messages> = {
  tableId: string;
  table: Table<D>;
  extraItems?: ReactNode;
  messages: M;
};

const ContextMenu = <D, M extends Messages>(
  props: Props<D, M>
): JSX.Element => {
  const {tableId, table, extraItems, messages} = props;

  const {ContextMenu, hasContextMenu} = useEditor<D, M>();

  const hasTableContextMenu = hasContextMenu(table);

  return (
    <Menu id={`${tableId}-menu`}>
      {hasTableContextMenu && <ContextMenu table={table} messages={messages}/>}
      {hasTableContextMenu && extraItems && <Menu.Separator/>}
      {extraItems}
    </Menu>
  );
};

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
