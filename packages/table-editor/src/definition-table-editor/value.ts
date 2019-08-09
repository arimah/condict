import {List, Map, Record, RecordOf} from 'immutable';

import genId from '@condict/gen-id';

import Value, {CellOf} from '../value';
import Layout from '../value/layout';
import Selection from '../value/selection';
import {Row, Cell as CellType, CellFields} from '../value/types';
import {convertStandardTable} from '../value-helpers/convert';

import {InflectionTableJson} from '../inflection-table-editor/types';

import {DataFields} from './types';

const Data = Record<DataFields>({
  // Header text or inflection pattern
  text: '',
  // Custom inflected form (data cells only)
  customForm: null,
  inflectedFormId: null,
});

const Cell = CellOf(Data);

export default class DefinitionTableValue extends Value<DataFields> {
  public constructor(
    rows: List<Row<DataFields>>,
    layout?: Layout,
    selection?: Selection
  ) {
    super(rows, layout, selection);
  }

  public make(
    rows?: List<Row<DataFields>>,
    layout?: Layout,
    selection?: Selection
  ): this {
    if (!rows) {
      throw new Error('DefinitionTableValue cannot be created without rows');
    }
    return new DefinitionTableValue(rows, layout, selection) as this;
  }

  public isCellEmpty(_cell: CellType<DataFields>): boolean {
    return false;
  }

  public emptyData(): RecordOf<DataFields> {
    return Data();
  }

  public createCellFrom(protoCell: CellType<DataFields>): CellType<DataFields> {
    return Cell({
      key: genId(),
      header: protoCell.header,
    });
  }

  public toJS(): Map<number, string> {
    let customForms = Map<number, string>();
    this.rows.forEach(row => {
      row.cells.forEach(cell => {
        if (
          cell.data.inflectedFormId !== null &&
          cell.data.customForm !== null
        ) {
          customForms = customForms.set(
            cell.data.inflectedFormId,
            cell.data.customForm
          );
        }
      });
    });
    return customForms;
  }

  public static from(
    tableData: InflectionTableJson,
    customForms: Map<number, string>
  ): DefinitionTableValue {
    return new DefinitionTableValue(
      convertStandardTable(tableData, cell => {
        const cellFields: Partial<CellFields<DataFields>> = {
          rowSpan: cell.rowSpan || 1,
          columnSpan: cell.columnSpan || 1,
        };

        const {inflectedForm} = cell;
        if (inflectedForm) {
          if (inflectedForm.id === null) {
            throw new Error('Inflected form ID cannot be null');
          }

          const id = +inflectedForm.id;
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
