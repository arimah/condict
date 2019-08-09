import React, {
  Component,
  ComponentType,
  KeyboardEvent,
  MouseEvent as SyntheticMouseEvent,
  ReactNode,
  useCallback,
} from 'react';
import {is as immutableIs} from 'immutable';

import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';
import {Command, CommandGroup, CommandSpecMap} from '@condict/ui';

import Value from '../value';
import {Cell} from '../value/types';
import {mapToArray} from '../immutable-utils';
import makeTableRow from '../table-row';
import {Config as TableCellConfig} from '../table-cell';

import * as S from './styles';
import describeSelection from './describe-selection';
import NavigationCommands from './navigation-commands';
import MultiselectCommands from './multiselect-commands';
import StructureCommands from './structure-commands';

export type Config<D, V extends Value<D>> = {
  getCellDescription: (cell: Cell<D>) => string;
  canEditStructure: boolean;
  canSelectMultiple: boolean;
  commands: CommandSpecMap;
} & TableCellConfig<D, V>;

export interface Props<D, V extends Value<D>> {
  value: V;
  className?: string;
  disabled: boolean;
  onChange: (value: V) => void;
}

export interface CommandProps<D, V extends Value<D>> {
  value: V;
  disabled?: boolean;
  children: ReactNode;
  onChange: (value: V) => void;
}

export type TableEditorComponent<D, V extends Value<D>> = ComponentType<Props<D, V>> & {
  Commands<E extends keyof JSX.IntrinsicElements | React.ComponentType<unknown> = 'div'>(
    props: CommandProps<D, V> & Omit<React.ComponentPropsWithoutRef<E>, 'value' | 'disabled' | 'children' | 'onChange' | 'onKeyDown'> & {
      as?: E;
    }
  ): JSX.Element;
};

function makeTableEditor<D, V extends Value<D>>(
  config: Config<D, V>
): TableEditorComponent<D, V> {
  const {
    getCellDescription,
    canEditStructure,
    canSelectMultiple,
    canEditCell,
    commands,
  } = config;

  const TableRow = makeTableRow(config);

  const editingCommands: CommandSpecMap = {
    ...canEditStructure && StructureCommands,
    ...commands,
  };
  const allCommands: CommandSpecMap = {
    ...NavigationCommands,
    ...canSelectMultiple && MultiselectCommands,
    ...editingCommands,
  };

  interface State {
    mouseDown: boolean;
    mouseDownCellKey: string | null;
    editing: boolean;
    editingCell: Cell<D> | null;
    editingTypedValue: string | null;
  }

  class TableEditor extends Component<Props<D, V>, State> {
    public static defaultProps = {
      disabled: false,
      onChange: () => { },
    };

    public state: State = {
      mouseDown: false,
      mouseDownCellKey: null,
      editing: false,
      editingCell: null,
      editingTypedValue: null,
    };

    private table = React.createRef<HTMLTableElement>();
    private tableId = genId();

    private handleCommand = (cmd: Command) => {
      if (this.props.disabled || this.state.editing) {
        return;
      }

      const nextValue = cmd.exec(this.props.value);
      this.emitChange(nextValue);
    };

    private handleKeyDown = (e: KeyboardEvent) => {
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
    };

    private handleKeyPress = (e: KeyboardEvent) => {
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
      // FIXME: Why are we using nativeEvent here? What's wrong with e.key?
      this.editFocusedCell(e.nativeEvent.key);
    };

    private handleMouseDown = (e: SyntheticMouseEvent) => {
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

      const cellKey = this.findNearestCellKey(e.target as HTMLElement);
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
      if (this.table.current) {
        this.table.current.focus();
      }
    };

    private handleMouseMove = (e: SyntheticMouseEvent) => {
      e.preventDefault();
      if (this.props.disabled) {
        return;
      }

      const cellKey = this.findNearestCellKey(e.target as HTMLElement);
      if (cellKey) {
        // Even if shift is no longer held, we want to extend the selection to
        // the new cell. If shift *was* held down on mouse down, we will have
        // kept the original selection start cell; otherwise, the mouse down
        // cell is the selection start.
        this.setFocusedCell(cellKey, true);
      }
    };

    private handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();

      const {mouseDownCellKey} = this.state;
      const cellKey = this.findNearestCellKey(e.target as HTMLElement);

      this.setState({mouseDown: false}, () => {
        if (mouseDownCellKey !== null && mouseDownCellKey === cellKey) {
          this.editFocusedCell();
        }
      });
      document.body.removeEventListener('mouseup', this.handleMouseUp, false);
    };

    private handleEditInput = (value: Cell<D>) => {
      this.setState({editingCell: value});
    };

    private handleFinishEdit = (newCellValue: Cell<D>) => {
      const {value, onChange} = this.props;

      const prevCellValue = value.getCell(value.selection.focusedCellKey);
      // Only emit the onChange event if something has actually changed. This is
      // mainly to avoid polluting potential undo stacks.
      if (prevCellValue && !immutableIs(prevCellValue, newCellValue)) {
        const nextValue = value.updateCellData(prevCellValue.key, newCellValue);
        onChange(nextValue);
      }

      this.setState({
        editing: false,
        editingCell: null,
        editingTypedValue: null,
      });
    };

    private findNearestCellKey(node: HTMLElement) {
      const table = this.table.current;
      while (
        node &&
        node !== table &&
        node.dataset && // document has no dataset
        !node.dataset.cellKey
      ) {
        node = node.parentNode as HTMLElement;
      }

      if (node && node.dataset && node.dataset.cellKey) {
        return node.dataset.cellKey;
      }
      return null;
    }

    private setFocusedCell(focusedCellKey: string, extendSelection: boolean) {
      const {value: prevValue} = this.props;

      const nextValue = prevValue.withFocusedCell(
        focusedCellKey,
        canSelectMultiple && extendSelection
      );
      this.emitChange(nextValue);
    }

    private editFocusedCell(typedValue: string | null = null) {
      const {value} = this.props;
      const {focusedCellKey} = value.selection;
      const cell = value.getCell(focusedCellKey);

      if (cell && canEditCell(cell)) {
        this.setState({
          editing: true,
          editingCell: cell,
          editingTypedValue: typedValue,
        });
      }
    }

    private emitChange(nextValue: V) {
      if (this.props.value !== nextValue) {
        this.props.onChange(nextValue);
      }
    }

    public render() {
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
            aria-disabled={disabled ? 'true' : 'false'}
            aria-multiselectable={canSelectMultiple ? 'true' : 'false'}
            aria-describedby={`${this.tableId}-tableHint`}
            onKeyDown={this.handleKeyDown}
            onKeyPress={this.handleKeyPress}
            onMouseDown={this.handleMouseDown}
            onMouseMove={mouseDown ? this.handleMouseMove : undefined}
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

    private renderHelper() {
      const {disabled, value} = this.props;
      const {selection} = value;
      const {editing} = this.state;

      const cell = value.getCell(selection.focusedCellKey);

      return (
        <S.Helper disabled={disabled}>
          <SROnly id={`${this.tableId}-cellHint`}>
            {describeSelection(selection)}
            {cell && getCellDescription(cell)}
          </SROnly>
          <span id={`${this.tableId}-tableHint`}>
            {editing && <>Press <b>Enter</b> or <b>ESC</b> when done.</>}
            {!editing && <>Press <b>Enter</b> or <b>F2</b> to edit the current cell.</>}
          </span>
        </S.Helper>
      );
    }

    public static Commands<E extends keyof JSX.IntrinsicElements | React.ComponentType<unknown> = 'div'>(
      props: CommandProps<D, V> & Omit<React.ComponentPropsWithoutRef<E>, 'value' | 'disabled' | 'children' | 'onChange' | 'onKeyDown'> & {
        as?: E;
      }
    ) {
      const {
        disabled = false,
        children,
        value,
        onChange,
        ...otherProps
      } = props;

      const handleExec = useCallback((cmd: Command) => {
        const nextValue = cmd.exec(value);
        onChange(nextValue);
      }, [value, onChange]);

      return (
        <CommandGroup
          {...otherProps}
          commands={editingCommands}
          disabled={disabled}
          onExec={handleExec}
        >
          {children}
        </CommandGroup>
      );
    }
  }

  return TableEditor;
}

export default makeTableEditor;
