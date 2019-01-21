import {List, Record} from 'immutable';

import genId from '@condict/gen-id';

import Value, {Row, CellOf} from '../value';
import {convertStandardTable} from '../value-helpers/convert';

import getDerivedDisplayName from './get-derived-name';

const Data = Record({
  text: '',
  // The below apply only to inflected forms (i.e. data cells)
  deriveLemma: true,
  displayName: '',
  hasCustomDisplayName: false,
  inflectedFormId: null,
});

const Cell = CellOf(Data);

const defaultRows = () =>
  List.of(
    Row({
      key: genId(),
      cells: List.of(
        Cell({key: genId(), header: false})
      ),
    })
  );

export default class InflectionTableValue extends Value {
  constructor(rows, selection, layout) {
    super(rows || defaultRows(), selection, layout);
  }

  isCellEmpty(cell) {
    return cell.data.text === '';
  }

  emptyData() {
    return Data();
  }

  createCellFrom(protoCell) {
    return Cell({
      key: genId(),
      header: protoCell.header,
    });
  }

  toJS() {
    const rows = [];
    this.rows.forEach(row => {
      const cells = [];
      row.cells.forEach(cell => {
        const {data} = cell;
        const convertedCell = {
          rowSpan: cell.rowSpan,
          columnSpan: cell.columnSpan,
          header: cell.header,
        };
        if (cell.header) {
          convertedCell.headerText = data.text;
        } else {
          convertedCell.inflectedForm = {
            id: data.inflectedFormId,
            inflectionPattern: data.text,
            deriveLemma: data.deriveLemma,
            displayName: data.hasCustomDisplayName
              ? data.displayName
              // FIXME: This is really inefficient for larger tables.
              : getDerivedDisplayName(this, cell.key),
            hasCustomDisplayName: data.hasCustomDisplayName,
          };
        }
        cells.push(convertedCell);
      });
      rows.push({cells});
    });
    return rows;
  }

  static from(tableData) {
    return new InflectionTableValue(
      convertStandardTable(tableData, cell => {
        const cellFields = {
          rowSpan: cell.rowSpan || 1,
          columnSpan: cell.columnSpan || 1,
        };

        const {inflectedForm} = cell;
        if (inflectedForm) {
          cellFields.data = Data({
            text: inflectedForm.inflectionPattern,
            deriveLemma: inflectedForm.deriveLemma,
            displayName: inflectedForm.hasCustomDisplayName
              ? inflectedForm.displayName
              : '',
            hasCustomDisplayName: inflectedForm.hasCustomDisplayName,
            inflectedFormId: inflectedForm.id | 0,
          });
        } else {
          cellFields.header = true;
          cellFields.data = Data({text: cell.headerText});
        }
        return Cell(cellFields);
      })
    );
  }
}
