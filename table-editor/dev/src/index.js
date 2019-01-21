import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {ThemeProvider} from 'styled-components';
import {Map, Stack} from 'immutable';

import {
  Button,
  Checkbox,
  Switch,
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
    const {value, children} = this.props;
    const {disabled} = this.state;

    return (
      <S.EditorContainer>
        <S.Group>
          <span>
            <Button
              intent='secondary'
              slim
              disabled={!value.canUndo}
              label='Undo'
              onClick={this.handleUndo}
            />
            {' '}
            <Button
              intent='secondary'
              slim
              disabled={!value.canRedo}
              label='Redo'
              onClick={this.handleRedo}
            />
          </span>
          <S.Separator/>
          <Checkbox
            checked={disabled}
            label='Disabled'
            onChange={this.handleToggleDisabled}
          />
        </S.Group>

        {children(value.value, disabled, this.handleSetValue)}
      </S.EditorContainer>
    );
  }
}

EditorDemo.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
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
