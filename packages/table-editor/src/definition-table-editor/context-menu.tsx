import React from 'react';

import {Menu} from '@condict/ui';

import {ContextMenuProps} from '../table-editor';

import Value from './value';

type Props = ContextMenuProps<Value>;

const ContextMenu = ({value}: Props) => {
  const {focusedCellKey} = value.selection;
  const focusedCell = value.getCell(focusedCellKey);

  if (!focusedCell) {
    return null;
  }

  return <>
    <Menu.Item
      label='Use default form'
      command='restoreSelectedForms'
      disabled={focusedCell.data.customForm === null}
    />
    <Menu.Item
      label='Delete this form'
      command='deleteSelectedForms'
      disabled={focusedCell.data.customForm === ''}
    />
  </>;
};

export default ContextMenu;

export const hasContextMenu = (value: Value) => {
  const {focusedCellKey} = value.selection;
  const focusedCell = value.getCell(focusedCellKey);
  return focusedCell !== null && !focusedCell.header;
};
