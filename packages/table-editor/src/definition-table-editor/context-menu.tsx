import {Menu} from '@condict/ui';

import {Table} from '../value';
import {ContextMenuProps} from '../types';

import {DefinitionTable, DefinitionTableData, Messages} from './types';

type Props = ContextMenuProps<DefinitionTableData, Messages>;

const ContextMenu = ({table, messages}: Props): JSX.Element | null => {
  const focusedData = Table.getData(table, table.selection.focus);

  return <>
    <Menu.Item
      label={messages.useDefaultFormMenu()}
      command='restoreSelectedForms'
      disabled={focusedData.customForm === null}
    />
    <Menu.Item
      label={messages.deleteThisForm()}
      command='deleteSelectedForms'
      disabled={focusedData.customForm === ''}
    />
  </>;
};

export default ContextMenu;

export const hasContextMenu = (table: DefinitionTable): boolean => {
  const focusedCell = Table.getCell(table, table.selection.focus);
  return !focusedCell.header;
};
