import React from 'react';

import {Menu} from '@condict/ui';

import {ContextMenuProps} from '../table-editor';

import Value from './value';
import {Messages} from './types';

type Props = ContextMenuProps<Value, Messages>;

const ContextMenu = ({value, messages}: Props): JSX.Element | null => {
  const {focusedCellKey} = value.selection;
  const focusedCell = value.getCell(focusedCellKey);

  if (!focusedCell) {
    return null;
  }

  return <>
    <Menu.Item
      label={messages.useDefaultFormMenu()}
      command='restoreSelectedForms'
      disabled={focusedCell.data.customForm === null}
    />
    <Menu.Item
      label={messages.deleteThisForm()}
      command='deleteSelectedForms'
      disabled={focusedCell.data.customForm === ''}
    />
  </>;
};

export default ContextMenu;

export const hasContextMenu = (value: Value): boolean => {
  const {focusedCellKey} = value.selection;
  const focusedCell = value.getCell(focusedCellKey);
  return focusedCell !== null && !focusedCell.header;
};
