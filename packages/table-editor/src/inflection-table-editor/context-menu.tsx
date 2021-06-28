import React from 'react';
import MergeIcon from 'mdi-react/TableMergeCellsIcon';
import SeparateIcon from 'mdi-react/TableSplitCellIcon';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';

import {Menu} from '@condict/ui';

import {Table} from '../value';
import {reduceSelected} from '../operations';
import {ContextMenuProps} from '../types';

import {InflectionTableData, Messages} from './types';

type Props = ContextMenuProps<InflectionTableData, Messages>;

type SelectionInfo = {
  canSeparateCells: boolean;
  hasDataCells: boolean;
};

const getSelectionInfo = (table: Table<InflectionTableData>) =>
  reduceSelected<InflectionTableData, SelectionInfo>(
    table,
    {canSeparateCells: false, hasDataCells: false},
    (result, cell) => {
      if (cell.columnSpan > 1 || cell.rowSpan > 1) {
        result.canSeparateCells = true;
      }
      if (!cell.header) {
        result.hasDataCells = true;
      }
      return result;
    }
  );

const ContextMenu = ({table, messages}: Props): JSX.Element | null => {
  const {selectionShape: sel} = table;
  const focusedCell = Table.getCell(table, sel.focus);
  const focusedData = Table.getData(table, sel.focus);
  const selInfo = getSelectionInfo(table);

  if (!focusedCell) {
    return null;
  }

  return <>
    <Menu.CheckItem
      label={messages.headerCellMenu(sel.cells.size)}
      checked={focusedCell.header}
      command='toggleHeader'
    />
    <Menu.CheckItem
      label={messages.deriveLemmaMenu(sel.cells.size)}
      checked={selInfo.hasDataCells && focusedData.deriveLemma}
      command='toggleDeriveLemma'
      disabled={!selInfo.hasDataCells}
    />
    <Menu.Separator/>
    <Menu.Item
      label={messages.mergeCells()}
      icon={<MergeIcon/>}
      command='mergeSelection'
      disabled={sel.cells.size === 1}
    />
    <Menu.Item
      label={messages.separateCells()}
      icon={<SeparateIcon/>}
      command='separateSelection'
      disabled={!selInfo.canSeparateCells}
    />
    <Menu.Separator/>
    <Menu.Item label={messages.insertSubmenu()}>
      <Menu.Item
        label={messages.insertRowAbove()}
        icon={<InsertRowAboveIcon/>}
        command='insertRowAbove'
      />
      <Menu.Item
        label={messages.insertRowBelow()}
        icon={<InsertRowBelowIcon/>}
        command='insertRowBelow'
      />
      <Menu.Separator/>
      <Menu.Item
        label={messages.insertColumnBefore()}
        icon={<InsertColumnBeforeIcon className='rtl-mirror'/>}
        command='insertColumnBefore'
      />
      <Menu.Item
        label={messages.insertColumnAfter()}
        icon={<InsertColumnAfterIcon className='rtl-mirror'/>}
        command='insertColumnAfter'
      />
    </Menu.Item>
    <Menu.Separator/>
    <Menu.Item
      label={messages.deleteRows(sel.maxRow - sel.minRow + 1)}
      icon={<DeleteRowIcon/>}
      command='deleteSelectedRows'
    />
    <Menu.Item
      label={messages.deleteColumns(sel.maxColumn - sel.minColumn + 1)}
      icon={<DeleteColumnIcon/>}
      command='deleteSelectedColumns'
    />
  </>;
};

export default ContextMenu;
