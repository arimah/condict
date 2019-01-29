import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {is as immutableIs} from 'immutable';

import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';
import {CommandGroup} from '@condict/admin-ui';

import {mapToArray} from '../immutable-utils';
import makeTableRow from '../table-row';

import * as S from './styles';
import SelectionDesc from './selection-desc';
import NavigationCommands from './navigation-commands';
import MultiselectCommands from './multiselect-commands';
import StructureCommands from './structure-commands';

const makeTableEditor = config => {
  const {
    Value,
    getCellDescription,
    canEditStructure,
    canSelectMultiple,
    canEditCell,
    commands,
  } = config;

  const TableRow = makeTableRow(config);

  const editingCommands = {
    ...canEditStructure && StructureCommands,
    ...commands,
  };
  const allCommands = {
    ...NavigationCommands,
    ...canSelectMultiple && MultiselectCommands,
    ...editingCommands,
  };

  class TableEditor extends Component {
    constructor() {
      super();

      this.state = {
        mouseDown: false,
        mouseDownCellKey: false,
        editing: false,
        editingCell: null,
        editingTypedValue: null,
      };

      this.table = React.createRef();
      this.tableId = genId();

      this.handleCommand = this.handleCommand.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleEditInput = this.handleEditInput.bind(this);
      this.handleFinishEdit = this.handleFinishEdit.bind(this);
    }

    handleCommand(cmd) {
      if (this.props.disabled || this.state.editing) {
        return;
      }

      const nextValue = cmd.exec(this.props.value);
      this.emitChange(nextValue);
    }

    handleKeyDown(e) {
      if (this.props.disabled || this.state.editing) {
        return;
      }

      switch (e.key) {
        // Enter, F2 = edit selected cell (nonconfigurable)
        case 'Enter':
        case 'F2':
          if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.stopPropagation();
            e.preventDefault();
            this.editFocusedCell();
          }
          break;
      }
    }

    handleKeyPress(e) {
      if (this.props.disabled || this.state.editing) {
        return;
      }

      // Assume (probably quite an unsafe assumption) that Ctrl+key (but not
      // Ctrl+Alt+key, which is AltGr+key on Windows) doesn't produces textual
      // input, and likewise for Cmd+key on macOS. This prevents a variety of
      // issues in Firefox, which likes to fire the keypress event even if the
      // key doesn't (usually) produce text.
      // This is not a flawless system, but in practice it works alright.
      if (e.ctrlKey && !e.altKey || e.metaKey) {
        return;
      }

      e.preventDefault();
      this.editFocusedCell(e.nativeEvent.key);
    }

    handleMouseDown(e) {
      // If we're in the process of editing a cell, we MUST NOT cancel mouse
      // events, as the cell editor contains interactive components.
      if (this.state.editing) {
        return;
      }

      // preventDefault mainly to prevent selection of text within the table.
      // It just feels wrong and weird.
      e.preventDefault();
      if (this.props.disabled) {
        return;
      }

      const cellKey = this.findNearestCellKey(e.target);
      if (cellKey) {
        const {value: {selection}} = this.props;

        this.setFocusedCell(cellKey, e.shiftKey);

        this.setState({
          mouseDown: true,
          mouseDownCellKey:
            !e.shiftKey && cellKey === selection.selectionStart
              ? cellKey
              : null,
        });
        document.body.addEventListener('mouseup', this.handleMouseUp, false);
      }

      // Because we preventDefault above, the table won't get focused
      // as a result of the click, so we have to focus it manually.
      this.table.current.focus();
    }

    handleMouseMove(e) {
      e.preventDefault();
      if (this.props.disabled) {
        return;
      }

      const cellKey = this.findNearestCellKey(e.target);
      if (cellKey) {
        // Even if shift is no longer held, we want to extend the selection to
        // the new cell. If shift *was* held down on mouse down, we will have
        // kept the original selection start cell; otherwise, the mouse down
        // cell is the selection start.
        this.setFocusedCell(cellKey, true);
      }
    }

    handleMouseUp(e) {
      e.preventDefault();

      const {mouseDownCellKey} = this.state;
      const cellKey = this.findNearestCellKey(e.target);

      this.setState({mouseDown: false}, () => {
        if (mouseDownCellKey !== null && mouseDownCellKey === cellKey) {
          this.editFocusedCell();
        }
      });
      document.body.removeEventListener('mouseup', this.handleMouseUp, false);
    }

    handleEditInput(value) {
      this.setState({editingCell: value});
    }

    handleFinishEdit(newCellValue) {
      const {value, onChange} = this.props;

      const prevCellValue = value.getCell(value.selection.focusedCellKey);
      // Only emit the onChange event if something has actually changed. This is
      // mainly to avoid polluting potential undo stacks.
      if (!immutableIs(prevCellValue, newCellValue)) {
        const nextValue = value.updateCellData(prevCellValue.key, newCellValue);
        onChange(nextValue);
      }

      this.setState({
        editing: false,
        editingCell: null,
        editingTypedValue: null,
      });
    }

    findNearestCellKey(node) {
      const table = this.table.current;
      while (
        node &&
        node !== table &&
        node.dataset && // document has no dataset
        !node.dataset.cellKey
      ) {
        node = node.parentNode;
      }

      if (node && node.dataset && node.dataset.cellKey) {
        return node.dataset.cellKey;
      }
      return null;
    }

    setFocusedCell(focusedCellKey, extendSelection) {
      const {value: prevValue} = this.props;

      const nextValue = prevValue.withFocusedCell(
        focusedCellKey,
        canSelectMultiple && extendSelection
      );
      this.emitChange(nextValue);
    }

    editFocusedCell(typedValue = null) {
      const {value} = this.props;
      const {focusedCellKey} = value.selection;
      const cell = value.getCell(focusedCellKey);

      if (canEditCell(cell)) {
        this.setState({
          editing: true,
          editingCell: cell,
          editingTypedValue: typedValue,
        });
      }
    }

    emitChange(nextValue) {
      if (this.props.value !== nextValue) {
        this.props.onChange(nextValue);
      }
    }

    render() {
      const {
        className,
        disabled,
        value,
      } = this.props;
      const {
        mouseDown,
        editing,
        editingCell,
        editingTypedValue,
      } = this.state;
      const {rows, selection, layout} = value;
      const editedLayoutCell = editingCell
        ? layout.cellFromKey(selection.focusedCellKey)
        : null;

      return (
        <CommandGroup
          as={S.TableWrapper}
          commands={allCommands}
          className={className}
          disabled={disabled || editing}
          onExec={this.handleCommand}
          onKeyDown={this.handleKeyDown}
        >
          <S.Table
            tabIndex={disabled ? undefined : 0}
            role='grid'
            aria-activedescendant={
              !disabled && selection.focusedCellKey
                ? `${this.tableId}-${selection.focusedCellKey}`
                : undefined
            }
            aria-disabled={String(disabled)}
            aria-multiselectable={String(canSelectMultiple)}
            aria-describedby={`${this.tableId}-tableHint`}
            onKeyDown={this.handleKeyDown}
            onKeyPress={this.handleKeyPress}
            onMouseDown={this.handleMouseDown}
            onMouseMove={mouseDown ? this.handleMouseMove : null}
            ref={this.table}
          >
            <tbody>
              {mapToArray(rows, (row, index) => {
                const containsEditor =
                  editedLayoutCell &&
                  editedLayoutCell.row === index;
                return (
                  <TableRow
                    key={row.key}
                    cells={row.cells}
                    tableId={this.tableId}
                    disabled={this.props.disabled}
                    selection={
                      index >= selection.minRow && index <= selection.maxRow
                        ? selection
                        : null
                    }
                    editingCell={containsEditor ? editingCell : null}
                    editingTypedValue={containsEditor ? editingTypedValue : null}
                    editingTableValue={containsEditor ? value : null}
                    onEditInput={this.handleEditInput}
                    onFinishEdit={this.handleFinishEdit}
                  />
                );
              })}
            </tbody>
          </S.Table>
          {this.renderHelper()}
        </CommandGroup>
      );
    }

    renderHelper() {
      const {disabled, value} = this.props;
      const {selection} = value;
      const {editing} = this.state;

      const cell = value.getCell(selection.focusedCellKey);

      return (
        <S.Helper disabled={disabled}>
          <SROnly id={`${this.tableId}-cellHint`}>
            <SelectionDesc selection={selection}/>
            {cell && getCellDescription(cell)}
          </SROnly>
          <span id={`${this.tableId}-tableHint`}>
            {editing && <>Press <b>Enter</b> or <b>ESC</b> when done.</>}
            {!editing && <>Press <b>Enter</b> or <b>F2</b> to edit the current cell.</>}
          </span>
        </S.Helper>
      );
    }
  }

  TableEditor.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.instanceOf(Value).isRequired,
    onChange: PropTypes.func,
  };

  TableEditor.defaultProps = {
    className: '',
    disabled: false,
    onChange: () => {},
  };

  class TableEditorCommands extends Component {
    constructor() {
      super();
      this.handleExec = this.handleExec.bind(this);
    }

    handleExec(cmd) {
      const {value, onChange} = this.props;
      const nextValue = cmd.exec(value);
      onChange(nextValue);
    }

    render() {
      const {
        disabled,
        children,
        value: _value,
        onChange: _onChange,
        ...otherProps
      } = this.props;
      return (
        <CommandGroup
          {...otherProps}
          commands={editingCommands}
          disabled={disabled}
          onExec={this.handleExec}
        >
          {children}
        </CommandGroup>
      );
    }
  };

  TableEditorCommands.propTypes = {
    value: PropTypes.instanceOf(Value).isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  };

  TableEditorCommands.defaultProps = {
    disabled: false,
  };

  TableEditor.Commands = TableEditorCommands;

  return TableEditor;
};

export default makeTableEditor;
