import React from 'react';

import {SROnly} from '@condict/ui';

import {Table} from '../value';
import {useEditor} from '../context';
import {Messages} from '../types';

import * as S from './styles';

export type Props<D, M extends Messages> = {
  tableId: string;
  editing: boolean;
  disabled: boolean;
  table: Table<D>;
  messages: M;
};

function TableHelper<D, M extends Messages>(props: Props<D, M>): JSX.Element {
  const {tableId, editing, disabled, table, messages} = props;
  const {selectionShape: sel} = table;

  const editor = useEditor<D, M>();

  const cell = Table.getCell(table, sel.focus);
  const data = Table.getData(table, sel.focus);

  return (
    <S.Helper disabled={disabled}>
      <SROnly id={`${tableId}-cellHint`}>
        {sel.cells.size > 1 ? messages.describeSelection(sel) : ''}
        {cell && editor.describeCell(messages, cell, data)}
      </SROnly>
      <span id={`${tableId}-tableHint`}>
        {editing
          ? messages.cellEditorHelper()
          : messages.tableEditorHelper()}
      </span>
    </S.Helper>
  );
}

export default TableHelper;
