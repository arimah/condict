import React from 'react';
import MergeIcon from 'mdi-react/TableMergeCellsIcon';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';

import {Menu} from '@condict/ui';

import {ContextMenuProps} from '../table-editor';
import reduceSelected from '../value-helpers/reduce-selected';

import Value from './value';
import {DataFields, Messages} from './types';

type Props = ContextMenuProps<Value, Messages>;

type SelectionInfo = {
  canSeparateCells: boolean;
  hasDataCells: boolean;
};

const getSelectionInfo = (value: Value) =>
  reduceSelected<DataFields, Value, SelectionInfo>(
    value,
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

const ContextMenu = ({value, messages}: Props) => {
  const {selection} = value;
  const {focusedCellKey} = selection;
  const focusedCell = value.getCell(focusedCellKey);
  const sel = getSelectionInfo(value);

  if (!focusedCell) {
    return null;
  }

  return <>
    <Menu.CheckItem
      label={messages.headerCellMenu(selection.size)}
      checked={focusedCell.header}
      command='toggleHeader'
    />
    <Menu.CheckItem
      label={messages.deriveLemmaMenu(selection.size)}
      checked={sel.hasDataCells && focusedCell.data.deriveLemma}
      command='toggleDeriveLemma'
      disabled={!sel.hasDataCells}
    />
    <Menu.Separator/>
    <Menu.Item
      label={messages.mergeCells()}
      icon={<MergeIcon/>}
      command='mergeSelection'
      disabled={selection.size === 1}
    />
    <Menu.Item
      label={messages.separateCells()}
      command='separateSelection'
      disabled={!sel.canSeparateCells}
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
        icon={<InsertColumnBeforeIcon/>}
        command='insertColumnBefore'
      />
      <Menu.Item
        label={messages.insertColumnAfter()}
        icon={<InsertColumnAfterIcon/>}
        command='insertColumnAfter'
      />
    </Menu.Item>
    <Menu.Separator/>
    <Menu.Item
      label={messages.deleteRows(selection.maxRow - selection.minRow + 1)}
      icon={<DeleteRowIcon/>}
      command='deleteSelectedRows'
    />
    <Menu.Item
      label={messages.deleteColumns(selection.maxCol - selection.minCol + 1)}
      icon={<DeleteColumnIcon/>}
      command='deleteSelectedColumns'
    />
  </>;
};

export default ContextMenu;
