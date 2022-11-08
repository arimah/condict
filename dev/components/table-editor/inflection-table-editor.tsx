import React, {useState, useCallback} from 'react';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';

import {Toolbar, Menu, CommandProvider} from '@condict/ui';
import {
  InflectionTable,
  InflectionTableEditor,
  useInflectionTableCommands,
} from '@condict/table-editor';

import {HistoryStack} from './history-stack';
import HistoryCommands from './history-commands';
import * as S from './styles';

export type Props = {
  value: HistoryStack<InflectionTable>;
  onChange: (value: HistoryStack<InflectionTable>) => void;
};

const Editor = (props: Props): JSX.Element | null => {
  const {value, onChange} = props;

  const [disabled, setDisabled] = useState(false);

  const handleChange = useCallback((nextTable: InflectionTable) => {
    const prevTable = value.value;
    // Change in selection does not contribute to the undo stack.
    if (
      nextTable.rows === prevTable.rows &&
      nextTable.cells === prevTable.cells &&
      nextTable.cellData === prevTable.cellData
    ) {
      onChange(HistoryStack.set(value, nextTable));
    } else {
      onChange(HistoryStack.push(value, nextTable));
    }
  }, [value]);

  const tableCommands = useInflectionTableCommands({
    value: value.value,
    onChange: handleChange,
    disabled,
  });

  return (
    <HistoryCommands value={value} onChange={onChange}>
      <S.ToolbarWrapper>
        <CommandProvider commands={tableCommands}>
          <Toolbar>
            <Toolbar.Group name='Edit row'>
              <Toolbar.Button
                title='Insert row above'
                command='insertRowAbove'
              >
                <InsertRowAboveIcon/>
              </Toolbar.Button>
              <Toolbar.Button
                title='Insert row below'
                command='insertRowBelow'
              >
                <InsertRowBelowIcon/>
              </Toolbar.Button>
              <Toolbar.Button
                title='Delete selected row(s)'
                command='deleteSelectedRows'
              >
                <DeleteRowIcon/>
              </Toolbar.Button>
            </Toolbar.Group>
            <Toolbar.Group name='Edit column'>
              <Toolbar.Button
                title='Insert column before'
                command='insertColumnBefore'
              >
                <InsertColumnBeforeIcon className='rtl-mirror'/>
              </Toolbar.Button>
              <Toolbar.Button
                title='Insert column after'
                command='insertColumnAfter'
              >
                <InsertColumnAfterIcon className='rtl-mirror'/>
              </Toolbar.Button>
              <Toolbar.Button
                title='Delete selected column(s)'
                command='deleteSelectedColumns'
              >
                <DeleteColumnIcon/>
              </Toolbar.Button>
            </Toolbar.Group>
            <Toolbar.Group>
              <Toolbar.Button command='undo'>Undo</Toolbar.Button>
              <Toolbar.Button command='redo'>Redo</Toolbar.Button>
            </Toolbar.Group>
            <Toolbar.Group>
              <Toolbar.Button
                checked={disabled}
                onClick={() => setDisabled(d => !d)}
              >
                Disabled
              </Toolbar.Button>
            </Toolbar.Group>
          </Toolbar>
        </CommandProvider>
      </S.ToolbarWrapper>

      <InflectionTableEditor
        disabled={disabled}
        value={value.value}
        contextMenuExtra={<>
          <Menu.Item label='Undo' command='undo'/>
          <Menu.Item label='Redo' command='redo'/>
        </>}
        onChange={handleChange}
      />
    </HistoryCommands>
  );
};

export default Editor;
