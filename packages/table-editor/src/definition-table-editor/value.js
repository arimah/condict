import {Map, Record} from 'immutable';

import genId from '@condict/gen-id';

import Value, {CellOf} from '../value';
import {convertStandardTable} from '../value-helpers/convert';

const Data = Record({
  // Header text or inflection pattern
  text: '',
  // Custom inflected form (data cells only)
  customForm: null,
  inflectedFormId: null,
});

const Cell = CellOf(Data);

export default class DefinitionTableValue extends Value {
  constructor(rows, selection, layout) {
    super(rows, selection, layout);
  }

  isCellEmpty(_cell) {
    return false;
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
    let customForms = Map();
    this.rows.forEach(row => {
      row.cells.forEach(cell => {
        if (!cell.header && cell.data.customForm !== null) {
          customForms = customForms.set(
            cell.data.inflectedFormId,
            cell.data.customForm
          );
        }
      });
    });
    return customForms;
  }

  static from(tableData, customForms) {
    return new DefinitionTableValue(
      convertStandardTable(tableData, cell => {
        const cellFields = {
          rowSpan: cell.rowSpan || 1,
          columnSpan: cell.columnSpan || 1,
        };

        const {inflectedForm} = cell;
        if (inflectedForm) {
          const id = inflectedForm.id | 0;
          cellFields.data = Data({
            text: inflectedForm.inflectionPattern,
            customForm: customForms.has(id) ? customForms.get(id) : null,
            inflectedFormId: id,
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
