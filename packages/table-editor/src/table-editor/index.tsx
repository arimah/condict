import React, {
  Component,
  ComponentType,
  KeyboardEvent,
  MouseEvent as SyntheticMouseEvent,
  MutableRefObject,
  ReactNode,
  useCallback,
} from 'react';
import {is as immutableIs} from 'immutable';

import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';
import {
  Command,
  CommandGroup,
  CommandSpecMap,
  Menu,
  MenuType,
  RelativeParent,
} from '@condict/ui';

import Value, {ValueData} from '../value';
import {Cell} from '../value/types';
import {mapToArray} from '../immutable-utils';
import makeTableRow from '../table-row';
import {Config as TableCellConfig} from '../table-cell';
import {Messages} from '../types';
import DefaultEditorMessages from '../messages';

import * as S from './styles';
import NavigationCommands from './navigation-commands';
import MultiselectCommands from './multiselect-commands';
import StructureCommands from './structure-commands';

export type Config<V extends Value<any>, M> = {
  ContextMenu: ComponentType<ContextMenuProps<V, M>>;
  DefaultMessages: M;
  hasContextMenu: (value: V) => boolean;
  getCellDescription: (cell: Cell<ValueData<V>>, messages: M) => string;
  canEditStructure: boolean;
  canSelectMultiple: boolean;
  commands: CommandSpecMap;
} & TableCellConfig<V, M>;

export type Props<V extends Value<any>, M> = {
  value: V;
  className?: string;
  disabled: boolean;
  contextMenuExtra?: ReactNode;
  messages?: Messages & M;
  onChange: (value: V) => void;
};

export type CommandProps<V extends Value<any>> = {
  value: V;
  disabled?: boolean;
  children: ReactNode;
  onChange: (value: V) => void;
};

export type ContextMenuProps<V extends Value<any>, M> = {
  value: V;
  messages: Messages & M;
};

export type TableEditorComponent<V extends Value<any>, M> = ComponentType<Props<V, M>> & {
  defaultProps: {
    disabled: boolean;
    onChange: (value: V) => void;
  };
  Commands<E extends keyof JSX.IntrinsicElements | React.ComponentType<unknown> = 'div'>(
    props: CommandProps<V> & Omit<
      React.ComponentPropsWithoutRef<E>,
      'value' | 'disabled' | 'children' | 'onChange' | 'onKeyDown'
    > & {
      as?: E;
    }
  ): JSX.Element;
};

function makeTableEditor<V extends Value<any>, M>(
  config: Config<V, M>
): TableEditorComponent<V, M> {
  const {
    ContextMenu,
    DefaultMessages: DefaultConfigMessages,
    hasContextMenu,
    getCellDescription,
    canEditStructure,
    canSelectMultiple,
    canEditCell,
    commands,
  } = config;

  const TableRow = makeTableRow(config);

  const DefaultMessages: Messages & M = {
    ...DefaultEditorMessages,
    ...DefaultConfigMessages,
  };

  const editingCommands: CommandSpecMap = {
    ...canEditStructure && StructureCommands,
    ...commands,
  };
  const allCommands: CommandSpecMap = {
    ...NavigationCommands,
    ...canSelectMultiple && MultiselectCommands,
    ...editingCommands,
  };

  type State = {
    mouseDown: boolean;
    mouseDownCellKey: string | null;
    editing: boolean;
    editingCell: Cell<ValueData<V>> | null;
    editingTypedValue: string | null;
    contextMenuOpen: boolean;
  };

  class TableEditor extends Component<Props<V, M>, State> {
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
      contextMenuOpen: false,
    };

    private table = React.createRef<HTMLTableElement>();
    private tableId = genId();
    private contextMenu = React.createRef<MenuType>();
    private contextMenuParent: MutableRefObject<RelativeParent> = {
      current: {x: 0, y: 0},
    };

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
      // events, as the cell editor contains interactive components. The table
      // only cares about primary and secondary button events.
      if (this.state.editing || !(e.button === 0 || e.button === 2)) {
        return;
      }

      // preventDefault mainly to prevent selection of text within the table.
      // It just feels wrong and weird. Only do this on primary button mouse
      // downs, so as not to disrupt the context menu.
      if (e.button === 0) {
        e.preventDefault();
      }

      if (this.props.disabled) {
        return;
      }

      const cellKey = this.findNearestCellKey(e.target as HTMLElement);
      if (cellKey) {
        const {value: {selection}} = this.props;

        if (e.button === 0 || !selection.isSelected(cellKey)) {
          this.setFocusedCell(cellKey, e.shiftKey);

          this.setState({
            mouseDown: true,
            mouseDownCellKey:
              !e.shiftKey && cellKey === selection.selectionStart
                ? cellKey
                : null,
          });
        }
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
      if (e.button === 0) {
        e.preventDefault();
      }

      const {mouseDown, mouseDownCellKey} = this.state;
      if (mouseDown) {
        const cellKey = this.findNearestCellKey(e.target as HTMLElement);

        this.setState({mouseDown: false}, () => {
          if (
            e.button === 0 &&
            mouseDownCellKey !== null &&
            mouseDownCellKey === cellKey
          ) {
            this.editFocusedCell();
          }
        });
      }
      document.body.removeEventListener('mouseup', this.handleMouseUp, false);
    };

    private handleContextMenu = (e: SyntheticMouseEvent) => {
      const {value, disabled} = this.props;
      if (this.state.editing) {
        return;
      }

      e.preventDefault();

      if (disabled) {
        return;
      }

      const {contextMenu, contextMenuParent} = this;
      if (hasContextMenu(value) && contextMenu.current) {
        if (e.button === 0) {
          const {selection} = this.props.value;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          contextMenuParent.current = document.getElementById(
            `${this.tableId}-${selection.focusedCellKey}`
          )!;
        } else {
          contextMenuParent.current = {x: e.clientX, y: e.clientY};
        }
        contextMenu.current.open(e.button === 0);
        this.setState({contextMenuOpen: true});
      }
    };

    private handleContextMenuClose = () => {
      if (this.table.current) {
        this.table.current.focus();
        this.setState({contextMenuOpen: false});
      }
    };

    private handleEditInput = (value: Cell<ValueData<V>>) => {
      this.setState({editingCell: value});
    };

    private handleFinishEdit = (newCellValue: Cell<ValueData<V>>) => {
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
        messages = DefaultMessages,
      } = this.props;
      const {
        mouseDown,
        editing,
        editingCell,
        editingTypedValue,
        contextMenuOpen,
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
            className={contextMenuOpen ? 'force-focus' : undefined}
            onKeyDown={this.handleKeyDown}
            onKeyPress={this.handleKeyPress}
            onMouseDown={this.handleMouseDown}
            onMouseMove={mouseDown ? this.handleMouseMove : undefined}
            onContextMenu={this.handleContextMenu}
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
                    messages={messages}
                    onEditInput={this.handleEditInput}
                    onFinishEdit={this.handleFinishEdit}
                  />
                );
              })}
            </tbody>
          </S.Table>
          {this.renderHelper()}
          {this.renderContextMenu()}
        </CommandGroup>
      );
    }

    private renderHelper() {
      const {disabled, value, messages = DefaultMessages} = this.props;
      const {selection} = value;
      const {editing} = this.state;

      const cell = value.getCell(selection.focusedCellKey);

      return (
        <S.Helper disabled={disabled}>
          <SROnly id={`${this.tableId}-cellHint`}>
            {selection.size > 1 ? messages.describeSelection(selection) : ''}
            {cell && getCellDescription(cell, messages)}
          </SROnly>
          <span id={`${this.tableId}-tableHint`}>
            {editing
              ? messages.cellEditorHelper()
              : messages.tableEditorHelper()}
          </span>
        </S.Helper>
      );
    }

    private renderContextMenu() {
      const {value, contextMenuExtra, messages = DefaultMessages} = this.props;
      return (
        <Menu
          id={`${this.tableId}-menu`}
          parentRef={this.contextMenuParent}
          onClose={this.handleContextMenuClose}
          ref={this.contextMenu}
        >
          <ContextMenu value={value} messages={messages}/>
          {contextMenuExtra && <>
            <Menu.Separator/>
            {contextMenuExtra}
          </>}
        </Menu>
      );
    }

    public static Commands<E extends keyof JSX.IntrinsicElements | React.ComponentType<unknown> = 'div'>(
      props: CommandProps<V> & Omit<
        React.ComponentPropsWithoutRef<E>,
        'value' | 'disabled' | 'children' | 'onChange' | 'onKeyDown'
      > & {
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
