import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {ThemeProvider} from 'styled-components';
import {Map, Stack} from 'immutable';

import {
  Button,
  Checkbox,
  Switch,
  CommandGroup,
  Shortcuts,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
} from '@condict/admin-ui';

import {
  InflectionTableEditor,
  InflectionTableValue,
  DefinitionTableEditor,
  DefinitionTableValue,
} from '../../src';

import InflectionTableData from './inflection-table-data.json';
import StemsInput from './stems-input';

import * as S from './styles';
import {
  InsertRowAboveIcon,
  InsertRowBelowIcon,
  DeleteRowIcon,
  InsertColumnBeforeIcon,
  InsertColumnAfterIcon,
  DeleteColumnIcon,
} from './icons';

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
const InitialStems = Map({
  'Plural root': 'nerk',
});

class ValueWithHistory {
  constructor(value, undoStack = Stack(), redoStack = Stack()) {
    this.value = value;
    this.undoStack = undoStack;
    this.redoStack = redoStack;
  }

  get canUndo() {
    return this.undoStack.size > 0;
  }

  get canRedo() {
    return this.redoStack.size > 0;
  }

  set(value) {
    return new ValueWithHistory(
      value,
      this.undoStack,
      this.redoStack
    );
  }

  push(value) {
    return new ValueWithHistory(
      value,
      this.undoStack.push(this.value),
      Stack()
    );
  }

  undo() {
    const value = this.undoStack.peek();
    const undoStack = this.undoStack.pop();
    const redoStack = this.redoStack.push(this.value);
    return new ValueWithHistory(value, undoStack, redoStack);
  }

  redo() {
    const value = this.redoStack.peek();
    const redoStack = this.redoStack.pop();
    const undoStack = this.undoStack.push(this.value);
    return new ValueWithHistory(value, undoStack, redoStack);
  }
}

class EditorDemo extends Component {
  constructor() {
    super();

    this.state = {
      disabled: false,
    };

    this.handleUndo = this.handleUndo.bind(this);
    this.handleRedo = this.handleRedo.bind(this);
    this.handleToggleDisabled = this.handleToggleDisabled.bind(this);
    this.handleSetValue = this.handleSetValue.bind(this);
  }

  handleUndo() {
    const {value, onChange} = this.props;
    onChange(value.undo());
  }

  handleRedo() {
    const {value, onChange} = this.props;
    onChange(value.redo());
  }

  handleToggleDisabled(e) {
    this.setState({disabled: e.target.checked});
  }

  handleSetValue(nextValue) {
    const {value, onChange} = this.props;
    const prevValue = value.value;

    // Change in selection only doesn't contribute to the undo stack.
    if (nextValue.rows !== prevValue.rows) {
      onChange(value.push(nextValue));
    } else {
      onChange(value.set(nextValue));
    }
  }

  render() {
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

EditorDemo.propTypes = {
  value: PropTypes.object.isRequired,
  controls: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
};

EditorDemo.defaultProps = {
  controls: null,
};

class App extends Component {
  constructor() {
    super();

    this.state = {
      darkTheme: false,
      term: 'nerku',
      stems: InitialStems,
      inflectionTableValue: new ValueWithHistory(InitialInflectionTableValue),
      definitionTableValue: new ValueWithHistory(InitialDefinitionTableValue),
    };

    this.nextFormId = 100; // arbitrarily large value

    this.handleToggleDarkTheme = this.handleToggleDarkTheme.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleStemsChange = this.handleStemsChange.bind(this);
    this.handleInflectionTableChange = this.handleInflectionTableChange.bind(this);
    this.handleDefinitionTableChange = this.handleDefinitionTableChange.bind(this);
    this.handleCopyTableLayout = this.handleCopyTableLayout.bind(this);
  }

  handleToggleDarkTheme(e) {
    this.setState({darkTheme: e.target.checked});
  }

  handleTermChange(e) {
    this.setState({term: e.target.value});
  }

  handleStemsChange(stems) {
    this.setState({stems});
  }

  handleInflectionTableChange(value) {
    this.setState({inflectionTableValue: value});
  }

  handleDefinitionTableChange(value) {
    this.setState({definitionTableValue: value});
  }

  handleCopyTableLayout() {
    const {inflectionTableValue, definitionTableValue} = this.state;

    const inflectionTableData = inflectionTableValue.value.toJS();
    inflectionTableData.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.inflectedForm && cell.inflectedForm.id === null) {
          cell.inflectedForm.id = this.nextFormId;
          this.nextFormId++;
        }
      });
    });
    console.log('Inflection table data = ', inflectionTableData); // eslint-disable-line no-console

    const definitionTableData = definitionTableValue.value.toJS();
    console.log('Definition table data = ', definitionTableData); // eslint-disable-line no-console

    this.setState({
      definitionTableValue: definitionTableValue.push(
        DefinitionTableValue.from(inflectionTableData, definitionTableData)
      ),
    });
  }

  render() {
    const {
      darkTheme,
      term,
      stems,
      inflectionTableValue,
      definitionTableValue,
    } = this.state;

    return (
      <ThemeProvider theme={darkTheme ? DarkTheme : LightTheme}>
        <>
          <h1>Table editor</h1>

          <p>
            <Switch
              intent='secondary'
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
                  as={S.Group}
                  disabled={disabled}
                  value={value.value}
                  onChange={setValue}
                >
                  <>
                    <S.IconButton
                      slim
                      intent='secondary'
                      label='Insert row above'
                      command='insertRowAbove'
                    >
                      <InsertRowAboveIcon size={17}/>
                    </S.IconButton>
                    <S.IconButton
                      slim
                      intent='secondary'
                      label='Insert row below'
                      command='insertRowBelow'
                    >
                      <InsertRowBelowIcon size={17}/>
                    </S.IconButton>
                    <S.IconButton
                      slim
                      intent='secondary'
                      label='Delete selected row(s)'
                      command='deleteSelectedRows'
                    >
                      <DeleteRowIcon size={17}/>
                    </S.IconButton>
                    <S.Separator/>
                    <S.IconButton
                      slim
                      intent='secondary'
                      label='Insert column before'
                      command='insertColumnBefore'
                    >
                      <InsertColumnBeforeIcon size={17}/>
                    </S.IconButton>
                    <S.IconButton
                      slim
                      intent='secondary'
                      label='Insert column after'
                      command='insertColumnAfter'
                    >
                      <InsertColumnAfterIcon size={17}/>
                    </S.IconButton>
                    <S.IconButton
                      slim
                      intent='secondary'
                      label='Delete selected column(s)'
                      command='deleteSelectedColumns'
                    >
                      <DeleteColumnIcon size={17}/>
                    </S.IconButton>
                    <S.Separator/>
                    <Button
                      slim
                      intent='secondary'
                      label='Undo'
                      command='undo'
                    />
                    <Button
                      slim
                      intent='secondary'
                      label='Redo'
                      command='redo'
                    />
                    <S.Separator/>
                    <Checkbox
                      label='Disabled'
                      checked={disabled}
                      onChange={toggleDisabled}
                    />
                  </>
                </InflectionTableEditor.Commands>
              }
            >
              {(value, disabled, onChange) =>
                <InflectionTableEditor
                  disabled={disabled}
                  value={value}
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
            <p>Stems:</p>
            <StemsInput
              initialValue={InitialStems}
              onChange={this.handleStemsChange}
            />

            <EditorDemo
              value={definitionTableValue}
              onChange={this.handleDefinitionTableChange}
              controls={({disabled, toggleDisabled}) =>
                <S.Group>
                  <Button
                    slim
                    intent='secondary'
                    label='Undo'
                    command='undo'
                  />
                  <Button
                    slim
                    intent='secondary'
                    label='Redo'
                    command='redo'
                  />
                  <S.Separator/>
                  <Checkbox
                    label='Disabled'
                    checked={disabled}
                    onChange={toggleDisabled}
                  />
                </S.Group>
              }
            >
              {(value, disabled, onChange) =>
                <DefinitionTableEditor
                  disabled={disabled}
                  value={value}
                  onChange={onChange}
                  term={term}
                  stems={stems}
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
