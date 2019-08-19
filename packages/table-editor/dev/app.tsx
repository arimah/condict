import React, {ChangeEvent, Component, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';
import {Map, Stack} from 'immutable';
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
  CommandGroup,
  Shortcuts,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
  Intent,
} from '@condict/ui';

import {
  InflectionTableEditor,
  InflectionTableValue,
  DefinitionTableEditor,
  DefinitionTableValue,
  BaseValue as Value,
  InflectionTableJson,
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

const InitialInflectionTableValue = InflectionTableValue.from(
  InflectionTableData
);
const InitialDefinitionTableValue = DefinitionTableValue.from(
  InflectionTableData,
  Map([
    [6, 'nerkuar'],
    [12, ''],
  ])
);
const InitialStemNames = ['Plural root'];
const InitialStems = Map({
  'Plural root': 'nerk',
});

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

class ValueWithHistory<T> {
  public readonly value: T;
  public readonly undoStack: Stack<T>;
  public readonly redoStack: Stack<T>;

  public constructor(value: T, undoStack = Stack<T>(), redoStack = Stack<T>()) {
    this.value = value;
    this.undoStack = undoStack;
    this.redoStack = redoStack;
  }

  public get canUndo(): boolean {
    return this.undoStack.size > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.size > 0;
  }

  public set(value: T): ValueWithHistory<T> {
    return new ValueWithHistory(
      value,
      this.undoStack,
      this.redoStack
    );
  }

  public push(value: T): ValueWithHistory<T> {
    return new ValueWithHistory(
      value,
      this.undoStack.push(this.value),
      Stack()
    );
  }

  public undo(): ValueWithHistory<T> {
    const value = this.undoStack.peek();
    if (!value) {
      return this;
    }

    const undoStack = this.undoStack.pop();
    const redoStack = this.redoStack.push(this.value);
    return new ValueWithHistory(value, undoStack, redoStack);
  }

  public redo(): ValueWithHistory<T> {
    const value = this.redoStack.peek();
    if (!value) {
      return this;
    }

    const redoStack = this.redoStack.pop();
    const undoStack = this.undoStack.push(this.value);
    return new ValueWithHistory(value, undoStack, redoStack);
  }
}

type EditorDemoProps<T extends Value<any>> = {
  value: ValueWithHistory<T>;
  controls?: (data: {
    disabled: boolean;
    value: ValueWithHistory<T>;
    setValue: (value: T) => void;
    toggleDisabled: () => void;
  }) => ReactNode;
  onChange: (value: ValueWithHistory<T>) => void;
  children: (value: T, disabled: boolean, setValue: (value: T) => void) => ReactNode;
};

type EditorDemoState = {
  disabled: boolean;
};

class EditorDemo<T extends Value<any>>
  extends Component<EditorDemoProps<T>, EditorDemoState>
{
  public state: EditorDemoState = {
    disabled: false,
  };

  private handleUndo = () => {
    const {value, onChange} = this.props;
    onChange(value.undo());
  };

  private handleRedo = () => {
    const {value, onChange} = this.props;
    onChange(value.redo());
  };

  private handleToggleDisabled = () => {
    this.setState({disabled: !this.state.disabled});
  };

  private handleSetValue = (nextValue: T) => {
    const {value, onChange} = this.props;
    const prevValue = value.value;

    // Change in selection only doesn't contribute to the undo stack.
    if (nextValue.rows !== prevValue.rows) {
      onChange(value.push(nextValue));
    } else {
      onChange(value.set(nextValue));
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
            disabled: !value.canUndo,
          },
          redo: {
            shortcut: Shortcuts.redo,
            exec: this.handleRedo,
            disabled: !value.canRedo,
          },
        }}
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
  stems: Map<string, string>;
  stemNames: string[];
  inflectionTableValue: ValueWithHistory<InflectionTableValue>;
  definitionTableValue: ValueWithHistory<DefinitionTableValue>;
};

class App extends Component<{}, State> {
  public state: State = {
    darkTheme: false,
    term: 'nerku',
    stems: InitialStems,
    stemNames: InitialStemNames,
    inflectionTableValue: new ValueWithHistory(InitialInflectionTableValue),
    definitionTableValue: new ValueWithHistory(InitialDefinitionTableValue),
  };
  private nextFormId: number = 100; // arbitrarily large value

  public constructor(props: {}) {
    super(props);

    this.handleToggleDarkTheme = this.handleToggleDarkTheme.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleStemsChange = this.handleStemsChange.bind(this);
    this.handleInflectionTableChange = this.handleInflectionTableChange.bind(this);
    this.handleDefinitionTableChange = this.handleDefinitionTableChange.bind(this);
    this.handleCopyTableLayout = this.handleCopyTableLayout.bind(this);

    window.importInflectionTable = data => {
      const value = InflectionTableValue.from(data);

      const {inflectionTableValue: valueWithHistory} = this.state;
      this.setState({
        inflectionTableValue: valueWithHistory.push(value),
      });
    };

    window.exportInflectionTable = () =>
      this.state.inflectionTableValue.value.toJS();
  }

  private handleToggleDarkTheme = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({darkTheme: e.target.checked});
  }

  private handleTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({term: e.target.value});
  };

  private handleStemsChange = (stems: Map<string, string>) => {
    this.setState({stems});
  };

  private handleInflectionTableChange = (
    value: ValueWithHistory<InflectionTableValue>
  ) => {
    this.setState({inflectionTableValue: value});
  };

  private handleDefinitionTableChange = (
    value: ValueWithHistory<DefinitionTableValue>
  ) => {
    this.setState({definitionTableValue: value});
  };

  private handleCopyTableLayout = () => {
    const {inflectionTableValue, definitionTableValue} = this.state;

    const stemNames = new Set<string>();
    const inflectionTableData = inflectionTableValue.value.toJS();
    inflectionTableData.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.inflectedForm) {
          collectStemNames(cell.inflectedForm.inflectionPattern, stemNames);

          if (cell.inflectedForm.id === null) {
            cell.inflectedForm.id = String(this.nextFormId);
            this.nextFormId++;
          }
        }
      });
    });
    console.log('Inflection table data = ', inflectionTableData); // eslint-disable-line no-console

    const definitionTableData = definitionTableValue.value.toJS();
    console.log('Definition table data = ', definitionTableData); // eslint-disable-line no-console

    this.setState({
      stemNames: Array.from(stemNames),
      definitionTableValue: definitionTableValue.push(
        DefinitionTableValue.from(inflectionTableData, definitionTableData)
      ),
    });
  };

  public render() {
    const {
      darkTheme,
      term,
      stems,
      stemNames,
      inflectionTableValue,
      definitionTableValue,
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
              value={inflectionTableValue}
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
            <Button onClick={this.handleCopyTableLayout}>
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
              onChange={this.handleStemsChange}
            />

            <EditorDemo
              value={definitionTableValue}
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
