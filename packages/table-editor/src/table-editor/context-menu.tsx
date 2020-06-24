import React, {ReactNode, Ref, RefObject} from 'react';

import {Menu, MenuType, RelativeParent} from '@condict/ui';

import {Table} from '../value';
import {useEditor} from '../context';
import {Messages} from '../types';

export type Props<D, M extends Messages> = {
  tableId: string;
  table: Table<D>;
  extraItems?: ReactNode;
  parentRef: RefObject<RelativeParent>;
  messages: M;
  onClose: () => void;
};

export type ContextMenuComponent = <D, M extends Messages>(
  props: Props<D, M> & {ref: Ref<MenuType>}
) => JSX.Element;

const ContextMenu = React.forwardRef(<D, M extends Messages>(
  props: Props<D, M>,
  ref: Ref<MenuType>
): JSX.Element => {
  const {tableId, table, extraItems, parentRef, messages, onClose} = props;

  const {ContextMenu, hasContextMenu} = useEditor<D, M>();

  const hasTableContextMenu = hasContextMenu(table);

  return (
    <Menu
      id={`${tableId}-menu`}
      parentRef={parentRef}
      onClose={onClose}
      ref={ref}
    >
      {hasTableContextMenu &&
        <ContextMenu table={table} messages={messages}/>}
      {hasTableContextMenu && extraItems && <Menu.Separator/>}
      {extraItems}
    </Menu>
  );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu as ContextMenuComponent;
