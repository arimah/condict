import React, {
  Component,
  KeyboardEvent,
  MouseEvent as SyntheticMouseEvent,
  FocusEvent,
  MutableRefObject,
  ReactNode,
} from 'react';
import {Draft} from 'immer';
import shallowEqual from 'shallowequal';

import {
  CommandGroup,
  CommandProvider,
  MenuType,
  RelativeParent,
  genUniqueId,
} from '@condict/ui';

import TableRow from '../table-row';
import {Table, CellKey, Selection, Layout} from '../value';
import EditorContext from '../context';
import {CellWithData, Messages, EditorContextValue} from '../types';

import Helper from './helper';
import ContextMenu from './context-menu';
import * as S from './styles';

export type Props<D, M extends Messages> = {
  table: Table<D>;
  className?: string;
  disabled: boolean;
  readOnly: boolean;
  contextMenuExtra?: ReactNode;
  messages: M;
  commands: CommandGroup;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onChange: (table: Table<D>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export type TableCommandFn<D> = (table: Table<D>) => Table<D>;

type State<D> = {
  mouseDown: boolean;
  mouseDownCellKey: string | null;
  editing: CellWithData<D> | null;
  editingTypedValue: string | null;
  contextMenuOpen: boolean;
};

class TableEditor<D, M extends Messages> extends Component<Props<D, M>, State<D>> {
  public static contextType = EditorContext;

  public static defaultProps = {
    disabled: false,
    readOnly: false,
    'aria-label': undefined,
    'aria-labelledby': undefined,
    'aria-describedby': undefined,
    onFocus: undefined,
    onBlur: undefined,
  };

  public declare context: EditorContextValue<D, M>;

  public state: State<D> = {
    mouseDown: false,
    mouseDownCellKey: null,
    editing: null,
    editingTypedValue: null,
    contextMenuOpen: false,
  };

  private readonly table = React.createRef<HTMLTableElement>();
  private readonly tableId = genUniqueId();
  private readonly focusedCellRef = React.createRef<HTMLElement>();
  private readonly contextMenuRef = React.createRef<MenuType>();
  private readonly contextMenuParent: MutableRefObject<RelativeParent> = {
    current: {x: 0, y: 0},
  };
  private hasFocus = false;
  private hadFocusOnMouseDown = false;

  public componentDidUpdate(): void {
    // NB: We don't need this logic in componentDidMount, as it is impossible
    // for the table to be focused immediately after mount.
    if (this.hasFocus) {
      this.focusedCellRef.current?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }

  private get canEdit(): boolean {
    return !(this.props.disabled || this.props.readOnly);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.canEdit || this.state.editing) {
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
      default:
        CommandGroup.handleKey(this.props.commands, e);
        break;
    }
  };

  private handleKeyPress = (e: KeyboardEvent) => {
    if (!this.canEdit || this.state.editing) {
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

    if (!this.canEdit) {
      return;
    }

    this.hadFocusOnMouseDown = this.hasFocus;

    const cellKey = this.findNearestCellKey(e.target as HTMLElement);
    if (cellKey) {
      const {table: {selectionShape: sel}} = this.props;

      if (e.button === 0 || !sel.cells.has(cellKey)) {
        this.setFocusedCell(cellKey, e.shiftKey);

        this.setState({
          mouseDown: true,
          mouseDownCellKey:
            !e.shiftKey && cellKey === sel.anchor
              ? cellKey
              : null,
        });
      }
      document.body.addEventListener('mouseup', this.handleMouseUp, false);
    }

    // Because we preventDefault above, the table won't get focused
    // as a result of the click, so we have to focus it manually.
    if (!this.hasFocus && this.table.current) {
      this.table.current.focus();
    }
  };

  private handleMouseMove = (e: SyntheticMouseEvent) => {
    e.preventDefault();
    if (!this.canEdit) {
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
        // Only open the editor if the table already had focus. It's disruptive
        // if the editor pops up when you just want to focus the table, since
        // the selection is invisible when the table is unfocused.
        if (
          this.hadFocusOnMouseDown &&
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
    if (this.state.editing) {
      return;
    }
    const {table, disabled, contextMenuExtra} = this.props;

    e.preventDefault();

    if (disabled) {
      return;
    }

    const {hasContextMenu} = this.context;
    const showContextMenu = hasContextMenu(table) || !!contextMenuExtra;
    const {contextMenuRef, contextMenuParent} = this;
    if (showContextMenu && contextMenuRef.current) {
      if (e.button === 0) {
        const {selection} = table;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        contextMenuParent.current = document.getElementById(
          `${this.tableId}-${selection.focus}`
        )!;
      } else {
        contextMenuParent.current = {x: e.clientX, y: e.clientY};
      }
      contextMenuRef.current.open(e.button === 0);
      this.setState({contextMenuOpen: true});
    }
  };

  private handleContextMenuClose = () => {
    if (this.table.current) {
      this.table.current.focus();
      this.setState({contextMenuOpen: false});
    }
  };

  private handleEditInput = (item: CellWithData<D>) => {
    this.setState({editing: item});
  };

  private handleEditCommit = ({cell, data}: CellWithData<D>) => {
    const {table, onChange} = this.props;

    const prevCell = Table.getCell(table, cell.key);
    const prevData = Table.getData(table, cell.key);

    // Only emit the onChange event if something has actually changed. This is
    // mainly to avoid polluting potential undo stacks.
    const isCellSame =
      shallowEqual(prevCell, cell) &&
      shallowEqual(prevData, data);
    if (!isCellSame) {
      const nextTable = Table.update(table, table => {
        table.cells.set(cell.key, cell);
        table.cellData.set(cell.key, data as Draft<D>);
      });
      onChange(nextTable);
    }

    this.setState({
      editing: null,
      editingTypedValue: null,
    });
  };

  private handleFocus = () => {
    if (!this.hasFocus) {
      this.hasFocus = true;
      this.props.onFocus?.();
    }
  };

  private handleBlur = (e: FocusEvent) => {
    // relatedTarget is the element that receives focus
    this.hasFocus =
      this.table.current?.contains(e.relatedTarget as Element) ??
      false;
    if (!this.hasFocus) {
      this.props.onBlur?.();
    }
  };

  private findNearestCellKey(node: HTMLElement) {
    const tableElem = this.table.current;
    while (
      node &&
      node !== tableElem &&
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

  private setFocusedCell(focus: CellKey, extendSelection: boolean) {
    const {table: prevTable} = this.props;
    const {multiSelect} = this.context;

    const nextTable = Table.update(prevTable, table => {
      table.selection = Selection.moveFocus(
        table.selection,
        focus,
        multiSelect && extendSelection
      );
    });
    this.emitChange(nextTable);
  }

  private editFocusedCell(typedValue: string | null = null) {
    const {table} = this.props;
    const {focus} = table.selection;
    const {canEditCell} = this.context;

    const cell = Table.getCell(table, focus);
    const data = Table.getData(table, focus);
    if (canEditCell(cell, data)) {
      this.setState({
        editing: {cell, data},
        editingTypedValue: typedValue,
      });
    }
  }

  private emitChange(nextTable: Table<D>) {
    if (this.props.table !== nextTable) {
      this.props.onChange(nextTable);
    }
  }

  public render(): JSX.Element {
    const {
      className,
      commands,
      disabled,
      readOnly,
      table,
      messages,
      contextMenuExtra,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
    } = this.props;
    const {mouseDown, editing, editingTypedValue, contextMenuOpen} = this.state;
    const {multiSelect} = this.context;
    const {rows, selectionShape: sel, layout} = table;
    const editedLayoutCell = editing && Layout.getCellByKey(layout, sel.focus);

    return (
      <S.TableWrapper className={className}>
        <CommandProvider commands={commands}>
          <S.Table
            tabIndex={disabled ? undefined : 0}
            aria-activedescendant={
              !disabled && sel.focus
                ? `${this.tableId}-${sel.focus}`
                : undefined
            }
            aria-disabled={disabled}
            aria-readonly={readOnly}
            aria-multiselectable={multiSelect}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            className={contextMenuOpen ? 'force-focus' : undefined}
            onKeyDown={this.handleKeyDown}
            onKeyPress={this.handleKeyPress}
            onMouseDown={this.handleMouseDown}
            onMouseMove={mouseDown ? this.handleMouseMove : undefined}
            onContextMenu={this.handleContextMenu}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            ref={this.table}
          >
            <tbody>
              {rows.map((row, index) => {
                const containsEditor =
                  editedLayoutCell &&
                  editedLayoutCell.homeRow === index;
                const cells = row.cells.map(key => ({
                  cell: Table.getCell(table, key),
                  data: Table.getData(table, key),
                }));
                return (
                  <TableRow
                    key={row.key}
                    cells={cells}
                    tableId={this.tableId}
                    disabled={this.props.disabled}
                    selection={
                      index >= sel.minRow && index <= sel.maxRow
                        ? sel
                        : null
                    }
                    editing={containsEditor ? editing : null}
                    editingTable={containsEditor ? table : null}
                    editingTypedValue={
                      containsEditor ? editingTypedValue : null
                    }
                    messages={messages}
                    focusedCellRef={this.focusedCellRef}
                    onInput={this.handleEditInput}
                    onCommit={this.handleEditCommit}
                  />
                );
              })}
            </tbody>
          </S.Table>
          <Helper tableId={this.tableId} table={table} messages={messages}/>
          <ContextMenu
            tableId={this.tableId}
            table={table}
            extraItems={contextMenuExtra}
            parentRef={this.contextMenuParent}
            messages={messages}
            onClose={this.handleContextMenuClose}
            ref={this.contextMenuRef}
          />
        </CommandProvider>
      </S.TableWrapper>
    );
  }
}

export default TableEditor;
