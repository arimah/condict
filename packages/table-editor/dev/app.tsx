import React, {ChangeEvent, Component, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';
import produce, {Draft} from 'immer';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';

import {
  Button,
  Switch,
  Toolbar,
  Menu,
  Command,
  CommandGroup,
  Shortcuts,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
  Intent,
} from '@condict/ui';

import {
  Table,
  InflectionTable,
  InflectionTableEditor,
  InflectionTableJson,
  InflectedFormJson,
  DefinitionTable,
  DefinitionTableEditor,
} from '../src';

import InflectionTableData from './inflection-table-data.json';
import StemsInput from './stems-input';

import * as S from './styles';

declare global {
  interface Window {
    importInflectionTable: (data: InflectionTableJson) => void;
    exportInflectionTable: () => InflectionTableJson;
  }
}

const InitialInflectionTableValue = InflectionTable.fromJson(
  InflectionTableData
);
const InitialDefinitionTableValue = DefinitionTable.fromJson(
  InflectionTableData,
  new Map([
    [6, 'nerkuar'],
    [12, ''],
  ])
);
const InitialStemNames = ['Plural root'];
const InitialStems = new Map([
  ['Plural root', 'nerk'],
]);

// Logic taken from the server-side code.
const collectStemNames = (pattern: string, stems: Set<string>) => {
  // Group 1: '{{' and '}}' (escape; ignored)
  // Group 2: The stem name, without the curly brackets
  const stemRegex = /(\{\{|\}\})|\{([^{}]+)\}/g;
  let m;
  while ((m = stemRegex.exec(pattern)) !== null) {
    // ~ is a special stem that always refers to the lemma.
    if (m[2] && m[2] !== '~') {
      stems.add(m[2]);
    }
  }
};

interface HistoryStack<T> {
  readonly value: T;
  readonly undoStack: readonly T[];
  readonly redoStack: readonly T[];
}

const HistoryStack = {
  create<T>(value: T): HistoryStack<T> {
    return {value, undoStack: [], redoStack: []};
  },

  canUndo<T>(history: HistoryStack<T>): boolean {
    return history.undoStack.length > 0;
  },

  canRedo<T>(history: HistoryStack<T>): boolean {
    return history.redoStack.length > 0;
  },

  set<T>(history: HistoryStack<T>, value: T): HistoryStack<T> {
    return produce(history, history => {
      history.value = value as Draft<T>;
    });
  },

  push<T>(history: HistoryStack<T>, value: T): HistoryStack<T> {
    return produce(history, history => {
      history.undoStack.push(history.value);
      history.redoStack = [];
      history.value = value as Draft<T>;
    });
  },

  undo<T>(history: HistoryStack<T>): HistoryStack<T> {
    if (history.undoStack.length === 0) {
      return history;
    }
    return produce(history, history => {
      history.redoStack.push(history.value);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      history.value = history.undoStack.pop()!;
    });
  },

  redo<T>(history: HistoryStack<T>): HistoryStack<T> {
    if (history.redoStack.length === 0) {
      return history;
    }
    return produce(history, history => {
      history.undoStack.push(history.value);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      history.value = history.redoStack.pop()!;
    });
  },
};

type EditorDemoProps<D> = {
  value: HistoryStack<Table<D>>;
  controls?: (data: {
    disabled: boolean;
    value: HistoryStack<Table<D>>;
    setValue: (value: Table<D>) => void;
    toggleDisabled: () => void;
  }) => ReactNode;
  onChange: (value: HistoryStack<Table<D>>) => void;
  children: (
    value: Table<D>,
    disabled: boolean,
    setValue: (value: Table<D>) => void
  ) => ReactNode;
};

type EditorDemoState = {
  disabled: boolean;
};

class EditorDemo<D>
  extends Component<EditorDemoProps<D>, EditorDemoState>
{
  public state: EditorDemoState = {
    disabled: false,
  };

  private handleUndo = () => {
    const {value, onChange} = this.props;
    onChange(HistoryStack.undo(value));
  };

  private handleRedo = () => {
    const {value, onChange} = this.props;
    onChange(HistoryStack.redo(value));
  };

  private handleCommand(cmd: Command) {
    cmd.exec();
  }

  private handleToggleDisabled = () => {
    this.setState({disabled: !this.state.disabled});
  };

  private handleSetValue = (nextValue: Table<D>) => {
    const {value, onChange} = this.props;
    const prevValue = value.value;

    // Change in selection only doesn't contribute to the undo stack.
    if (
      nextValue.rows === prevValue.rows &&
      nextValue.cells === prevValue.cells &&
      nextValue.cellData === prevValue.cellData
    ) {
      onChange(HistoryStack.set(value, nextValue));
    } else {
      onChange(HistoryStack.push(value, nextValue));
    }
  };

  public render() {
    const {value, controls, children} = this.props;
    const {disabled} = this.state;

    return (
      <CommandGroup
        as={S.EditorContainer}
        commands={{
          undo: {
            shortcut: Shortcuts.undo,
            exec: this.handleUndo,
            disabled: !HistoryStack.canUndo(value),
          },
          redo: {
            shortcut: Shortcuts.redo,
            exec: this.handleRedo,
            disabled: !HistoryStack.canRedo(value),
          },
        }}
        onExec={this.handleCommand}
      >
        {controls && controls({
          disabled,
          value,
          setValue: this.handleSetValue,
          toggleDisabled: this.handleToggleDisabled,
        })}

        {children(value.value, disabled, this.handleSetValue)}
      </CommandGroup>
    );
  }
}

type State = {
  darkTheme: boolean;
  term: string;
  stems: ReadonlyMap<string, string>;
  stemNames: string[];
  inflectionTable: HistoryStack<InflectionTable>;
  definitionTable: HistoryStack<DefinitionTable>;
};

class App extends Component<{}, State> {
  public state: State = {
    darkTheme: false,
    term: 'nerku',
    stems: InitialStems,
    stemNames: InitialStemNames,
    inflectionTable: HistoryStack.create(InitialInflectionTableValue),
    definitionTable: HistoryStack.create(InitialDefinitionTableValue),
  };
  private nextFormId = 100; // arbitrarily large value

  public constructor(props: {}) {
    super(props);

    window.importInflectionTable = data => {
      const value = InflectionTable.fromJson(data);

      const {inflectionTable: history} = this.state;
      this.setState({
        inflectionTable: HistoryStack.push(history, value),
      });
    };

    window.exportInflectionTable = () =>
      InflectionTable.export(this.state.inflectionTable.value);
  }

  private handleToggleDarkTheme = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({darkTheme: e.target.checked});
  }

  private handleTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({term: e.target.value});
  };

  private handleStemsChange = (stems: ReadonlyMap<string, string>) => {
    this.setState({stems});
  };

  private handleInflectionTableChange = (
    value: HistoryStack<InflectionTable>
  ) => {
    this.setState({inflectionTable: value});
  };

  private handleDefinitionTableChange = (
    value: HistoryStack<DefinitionTable>
  ) => {
    this.setState({definitionTable: value});
  };

  private handleCopyTableLayout = () => {
    const {inflectionTable, definitionTable} = this.state;

    const stemNames = new Set<string>();
    const inflectionTableData = InflectionTable.export(inflectionTable.value);
    inflectionTableData.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.inflectedForm) {
          collectStemNames(cell.inflectedForm.inflectionPattern, stemNames);

          if (cell.inflectedForm.id === null) {
            // Naughty hack.
            (cell.inflectedForm as Draft<InflectedFormJson>).id = this.nextFormId;
            this.nextFormId++;
          }
        }
      });
    });
    // eslint-disable-next-line no-console
    console.log('Inflection table data = ', inflectionTableData);

    const definitionTableData = DefinitionTable.exportCustomForms(
      definitionTable.value
    );
    // eslint-disable-next-line no-console
    console.log('Definition table data = ', definitionTableData);

    this.setState({
      stemNames: Array.from(stemNames),
      definitionTable: HistoryStack.push(
        definitionTable,
        DefinitionTable.fromJson(inflectionTableData, definitionTableData)
      ),
    });
  };

  public render() {
    const {
      darkTheme,
      term,
      stems,
      stemNames,
      inflectionTable,
      definitionTable,
    } = this.state;

    return (
      <ThemeProvider theme={darkTheme ? DarkTheme : LightTheme}>
        <>
          <h1>Table editor</h1>

          <p>
            <Switch
              intent={Intent.SECONDARY}
              checked={darkTheme}
              label='Dark theme'
              onChange={this.handleToggleDarkTheme}
            />
          </p>

          <section>
            <h2>InflectionTableEditor</h2>

            <EditorDemo
              value={inflectionTable}
              onChange={this.handleInflectionTableChange}
              controls={({disabled, value, setValue, toggleDisabled}) =>
                <InflectionTableEditor.Commands
                  as={S.ToolbarWrapper}
                  disabled={disabled}
                  value={value.value}
                  onChange={setValue}
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
                        onClick={toggleDisabled}
                      />
                    </Toolbar.Group>
                  </Toolbar>
                </InflectionTableEditor.Commands>
              }
            >
              {(value, disabled, onChange) =>
                <InflectionTableEditor
                  disabled={disabled}
                  value={value}
                  contextMenuExtra={
                    <>
                      <Menu.Item label='Undo' command='undo'/>
                      <Menu.Item label='Redo' command='redo'/>
                    </>
                  }
                  onChange={onChange}
                />
              }
            </EditorDemo>
          </section>

          <p>
            <Button bold onClick={this.handleCopyTableLayout}>
              &darr; Copy layout to definition table
            </Button>
          </p>

          <section>
            <h2>DefinitionTableEditor</h2>

            <p>
              <label>
                {'Term: '}
                <S.TermInput
                  value={term}
                  onChange={this.handleTermChange}
                />
              </label>
            </p>
            <StemsInput
              value={stems}
              stemNames={stemNames}
              term={term}
              onChange={this.handleStemsChange}
            />

            <EditorDemo
              value={definitionTable}
              onChange={this.handleDefinitionTableChange}
              controls={({disabled, toggleDisabled}) =>
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
                        onClick={toggleDisabled}
                      />
                    </Toolbar.Group>
                  </Toolbar>
                </S.ToolbarWrapper>
              }
            >
              {(value, disabled, onChange) =>
                <DefinitionTableEditor
                  disabled={disabled}
                  value={value}
                  onChange={onChange}
                  term={term}
                  stems={stems}
                  contextMenuExtra={
                    <>
                      <Menu.Item label='Undo' command='undo'/>
                      <Menu.Item label='Redo' command='redo'/>
                    </>
                  }
                />
              }
            </EditorDemo>
          </section>

          <S.AppStyles/>
          <ComponentStyles/>
        </>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app-root'));
