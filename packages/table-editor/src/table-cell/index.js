import React, {Component} from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

const makeTableCell = config => {
  const {
    CellData,
    CellEditor,
    canEditCell,
  } = config;

  class TableCell extends Component {
    shouldComponentUpdate(nextProps) {
      // Hand-rolled for more performance. PureComponent is *generally* fast
      // enough, but tables can end up with a lot of cells that need a lot
      // of checking.
      // Also, some props are *assumed* never to change.
      const prevProps = this.props;
      return (
        prevProps.cell !== nextProps.cell ||
        prevProps.disabled !== nextProps.disabled ||
        prevProps.focused !== nextProps.focused ||
        prevProps.selected !== nextProps.selected ||
        prevProps.editingCell !== nextProps.editingCell ||
        prevProps.editingTypedValue !== nextProps.editingTypedValue
        // editingTableValue is only passed to the cell editor, and does not
        // change (the new value is committed when the editor is closed), so
        // we don't need to check that.
      );
    }

    render() {
      const {
        cell,
        tableId,
        disabled,
        focused,
        selected,
        editingCell,
        editingTypedValue,
        editingTableValue,
        onEditInput,
        onFinishEdit,
      } = this.props;

      const effectiveCell = editingCell || cell;

      // NB: Don't attempt to change the cell tag from th to td or vice versa
      // whilst editing the cell, as that will force the editor to be remounted
      // (i.e. closed).
      // Also, don't read layout stuff or the cell key from editingCell, as cell
      // editors aren't allowed to change those values and it can seriously mess
      // up the table.
      return (
        <S.Cell
          as={cell.header ? 'th' : 'td'}
          id={`${tableId}-${cell.key}`}
          header={effectiveCell.header}
          selected={selected}
          disabled={disabled}
          colSpan={cell.columnSpan}
          rowSpan={cell.rowSpan}
          data-cell-key={cell.key}
          aria-selected={!disabled ? String(selected) : undefined}
          aria-readonly={String(!canEditCell(cell))}
          aria-labelledby={`${cell.key}-content`}
          aria-describedby={`${tableId}-cellHint`}
          aria-owns={editingCell ? `${cell.key}-editor` : undefined}
        >
          <S.CellDataWrapper
            id={`${cell.key}-content`}
            disabled={disabled}
          >
            <CellData
              cell={effectiveCell}
              editing={!!editingCell}
              disabled={disabled}
            />
          </S.CellDataWrapper>
          <S.CellBorder
            disabled={disabled}
            selected={selected}
            focused={focused}
          />
          {editingCell &&
            <CellEditor
              id={`${cell.key}-editor`}
              initialCell={editingCell}
              typedValue={editingTypedValue}
              tableValue={editingTableValue}
              onInput={onEditInput}
              onDone={onFinishEdit}
            />}
        </S.Cell>
      );
    }
  }

  TableCell.propTypes = {
    cell: PropTypes.object.isRequired,
    tableId: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    focused: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
    editingCell: PropTypes.object,
    editingTypedValue: PropTypes.string,
    editingTableValue: PropTypes.object,
    onEditInput: PropTypes.func.isRequired,
    onFinishEdit: PropTypes.func.isRequired,
  };

  TableCell.defaultProps = {
    editingCell: null,
    editingTypedValue: null,
    editingTableValue: null,
  };

  return TableCell;
};

export default makeTableCell;
