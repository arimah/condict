import React, {ChangeEvent, useState, useCallback} from 'react';

import {Toolbar, Menu} from '@condict/ui';
import {DefinitionTable, DefinitionTableEditor} from '@condict/table-editor';

import {HistoryStack} from './history-stack';
import HistoryCommands from './history-commands';
import StemsInput from './stems-input';
import * as S from './styles';

export type Props = {
  value: HistoryStack<DefinitionTable>;
  term: string;
  stems: ReadonlyMap<string, string>;
  stemNames: readonly string[];
  onChange: (value: HistoryStack<DefinitionTable>) => void;
  onChangeTerm: (term: string) => void;
  onChangeStems: (stems: ReadonlyMap<string, string>) => void;
};

const Editor = (props: Props): JSX.Element => {
  const {
    value,
    term,
    stems,
    stemNames,
    onChange,
    onChangeTerm,
    onChangeStems,
  } = props;

  const [disabled, setDisabled] = useState(false);

  const handleChange = useCallback((nextTable: DefinitionTable) => {
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

  const handleChangeTerm = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChangeTerm(e.target.value);
  }, [onChangeTerm]);

  return <>
    <p>
      <label>
        {'Term: '}
        <S.TermInput value={term} onChange={handleChangeTerm}/>
      </label>
    </p>
    <StemsInput
      value={stems}
      stemNames={stemNames}
      term={term}
      onChange={onChangeStems}
    />

    <HistoryCommands value={value} onChange={onChange}>
      <S.ToolbarWrapper>
        <Toolbar>
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
      </S.ToolbarWrapper>

      <DefinitionTableEditor
        disabled={disabled}
        value={value.value}
        onChange={handleChange}
        term={term}
        stems={stems}
        contextMenuExtra={<>
          <Menu.Item label='Undo' command='undo'/>
          <Menu.Item label='Redo' command='redo'/>
        </>}
      />
    </HistoryCommands>
  </>;
};

export default Editor;
