import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {mapToArray} from './immutable-utils';
import makeTableCell from './table-cell';

const makeTableRow = config => {
  const TableCell = makeTableCell(config);

  class TableRow extends Component {
    shouldComponentUpdate(nextProps) {
      // Hand-rolled for more performance. PureComponent is *generally* fast
      // enough, but tables can end up with a lot of rows that need a lot
      // of checking.
      // Also, some props are *assumed* never to change.
      const prevProps = this.props;
      return (
        prevProps.cells !== nextProps.cells ||
        prevProps.disabled !== nextProps.disabled ||
        prevProps.selection !== nextProps.selection ||
        prevProps.editingCell !== nextProps.editingCell ||
        prevProps.editingTypedValue !== nextProps.editingTypedValue
        // editingTableValue is only passed to the cell editor, and does not
        // change (the new value is committed when the editor is closed), so
        // we don't need to check that.
      );
    }

    render() {
      const {
        cells,
        tableId,
        disabled,
        selection,
        editingCell,
        editingTypedValue,
        editingTableValue,
        onEditInput,
        onFinishEdit,
      } = this.props;

      return (
        <tr>
          {mapToArray(cells, cell => {
            const focused = !!selection && selection.focusedCellKey === cell.key;
            const selected = !!selection && selection.isSelected(cell.key);

            return (
              <TableCell
                key={cell.key}
                cell={cell}
                tableId={tableId}
                disabled={disabled}
                focused={focused}
                selected={selected}
                editingCell={focused ? editingCell : null}
                editingTypedValue={
                  focused && editingCell
                    ? editingTypedValue
                    : null
                }
                editingTableValue={
                  focused && editingCell
                    ? editingTableValue
                    : null
                }
                onEditInput={onEditInput}
                onFinishEdit={onFinishEdit}
              />
            );
          })}
        </tr>
      );
    }
  }

  TableRow.propTypes = {
    cells: PropTypes.object.isRequired,
    tableId: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    selection: PropTypes.object,
    editingCell: PropTypes.object,
    editingTypedValue: PropTypes.string,
    editingTableValue: PropTypes.object,
    onEditInput: PropTypes.func.isRequired,
    onFinishEdit: PropTypes.func.isRequired,
  };

  TableRow.defaultProps = {
    selection: null,
    editingCell: null,
    editingTypedValue: null,
    editingTableValue: null,
  };

  return TableRow;
};

export default makeTableRow;
