import React, {useState, useCallback} from 'react';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';

import {Toolbar, Menu} from '@condict/ui';
import {InflectionTable, InflectionTableEditor} from '@condict/table-editor';

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

  return (
    <HistoryCommands
      value={value}
      onChange={onChange}
    >
      <InflectionTableEditor.Commands
        as={S.ToolbarWrapper}
        disabled={disabled}
        value={value.value}
        onChange={handleChange}
      >
        <Toolbar>
          <Toolbar.Group name='Edit row'>
            <Toolbar.Button
              label='Insert row above'
              command='insertRowAbove'
            >
              <InsertRowAboveIcon/>
            </Toolbar.Button>
            <Toolbar.Button
              label='Insert row below'
              command='insertRowBelow'
            >
              <InsertRowBelowIcon/>
            </Toolbar.Button>
            <Toolbar.Button
              label='Delete selected row(s)'
              command='deleteSelectedRows'
            >
              <DeleteRowIcon/>
            </Toolbar.Button>
          </Toolbar.Group>
          <Toolbar.Group name='Edit column'>
            <Toolbar.Button
              label='Insert column before'
              command='insertColumnBefore'
            >
              <InsertColumnBeforeIcon/>
            </Toolbar.Button>
            <Toolbar.Button
              label='Insert column after'
              command='insertColumnAfter'
            >
              <InsertColumnAfterIcon/>
            </Toolbar.Button>
            <Toolbar.Button
              label='Delete selected column(s)'
              command='deleteSelectedColumns'
            >
              <DeleteColumnIcon/>
            </Toolbar.Button>
          </Toolbar.Group>
          <Toolbar.Group>
            <Toolbar.Button label='Undo' command='undo'/>
            <Toolbar.Button label='Redo' command='redo'/>
          </Toolbar.Group>
          <Toolbar.Group>
            <Toolbar.Button
              label='Disabled'
              checked={disabled}
              onClick={() => setDisabled(d => !d)}
            />
          </Toolbar.Group>
        </Toolbar>
      </InflectionTableEditor.Commands>

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
