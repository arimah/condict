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
import {DataFields} from './types';

type Props = ContextMenuProps<DataFields, Value>;

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

const Messages = {
  toggleHeader: (n: number) =>
    n === 1 ? 'Header cell' : 'Header cells',
  toggleDeriveLemma: (n: number) =>
    n === 1 ? 'Add form to dictionary' : 'Add forms to dictionary',
  deleteRows: (n: number) =>
    n === 1 ? 'Delete row' : `Delete ${n} rows`,
  deleteColumns: (n: number) =>
    n === 1 ? 'Delete column' : `Delete ${n} columns`,
};

const ContextMenu = ({value}: Props) => {
  const {selection} = value;
  const {focusedCellKey} = selection;
  const focusedCell = value.getCell(focusedCellKey);
  const sel = getSelectionInfo(value);

  if (!focusedCell) {
    return null;
  }

  return <>
    <Menu.CheckItem
      label={Messages.toggleHeader(selection.size)}
      checked={focusedCell.header}
      command='toggleHeader'
    />
    <Menu.CheckItem
      label={Messages.toggleDeriveLemma(selection.size)}
      checked={sel.hasDataCells && focusedCell.data.deriveLemma}
      command='toggleDeriveLemma'
      disabled={!sel.hasDataCells}
    />
    <Menu.Separator/>
    <Menu.Item
      label='Merge cells'
      icon={<MergeIcon/>}
      command='mergeSelection'
      disabled={selection.size === 1}
    />
    <Menu.Item
      label='Separate cells'
      command='separateSelection'
      disabled={!sel.canSeparateCells}
    />
    <Menu.Separator/>
    <Menu.Item label='Insert'>
      <Menu.Item
        label='Row above'
        icon={<InsertRowAboveIcon/>}
        command='insertRowAbove'
      />
      <Menu.Item
        label='Row below'
        icon={<InsertRowBelowIcon/>}
        command='insertRowBelow'
      />
      <Menu.Separator/>
      <Menu.Item
        label='Column before'
        icon={<InsertColumnBeforeIcon/>}
        command='insertColumnBefore'
      />
      <Menu.Item
        label='Column after'
        icon={<InsertColumnAfterIcon/>}
        command='insertColumnAfter'
      />
    </Menu.Item>
    <Menu.Separator/>
    <Menu.Item
      label={Messages.deleteRows(selection.maxRow - selection.minRow + 1)}
      icon={<DeleteRowIcon/>}
      command='deleteSelectedRows'
    />
    <Menu.Item
      label={Messages.deleteColumns(selection.maxCol - selection.minCol + 1)}
      icon={<DeleteColumnIcon/>}
      command='deleteSelectedColumns'
    />
  </>;
};

export default ContextMenu;
