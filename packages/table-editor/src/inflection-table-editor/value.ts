import {List, Record, RecordOf} from 'immutable';

import genId from '@condict/gen-id';

import Value, {RowType, CellOf} from '../value';
import Layout from '../value/layout';
import Selection from '../value/selection';
import {Row, Cell as CellType, CellFields} from '../value/types';
import {convertStandardTable} from '../value-helpers/convert';

import {
  DataFields,
  InflectionTableJson,
  InflectionTableJsonRow,
  InflectionTableJsonCell,
} from './types';
import getDerivedDisplayName from './get-derived-name';

const Data = Record<DataFields>({
  text: '',
  deriveLemma: true,
  displayName: '',
  hasCustomDisplayName: false,
  inflectedFormId: null,
});

const Cell = CellOf<DataFields>(Data);

const defaultRows = () =>
  List.of(
    RowType({
      key: genId(),
      cells: List.of(
        Cell({key: genId(), header: false})
      ),
    })
  );

export default class InflectionTableValue extends Value<DataFields> {
  public constructor(
    rows?: List<Row<DataFields>>,
    layout?: Layout,
    selection?: Selection
  ) {
    super(rows || defaultRows(), layout, selection);
  }

  public make(
    rows?: List<Row<DataFields>>,
    layout?: Layout,
    selection?: Selection
  ): this {
    return new InflectionTableValue(rows, layout, selection) as this;
  }

  public isCellEmpty(cell: CellType<DataFields>): boolean {
    return cell.data.text === '';
  }

  public emptyData(): RecordOf<DataFields> {
    return Data();
  }

  public createCellFrom(protoCell: CellType<DataFields>) {
    return Cell({
      key: genId(),
      header: protoCell.header,
    });
  }

  public toJS(): InflectionTableJson {
    const rows: InflectionTableJsonRow[] = [];
    this.rows.forEach(row => {
      const cells: InflectionTableJsonCell[] = [];
      row.cells.forEach(cell => {
        const {data} = cell;
        const convertedCell: InflectionTableJsonCell = {};
        if (cell.rowSpan > 1) {
          convertedCell.rowSpan = cell.rowSpan;
        }
        if (cell.columnSpan > 1) {
          convertedCell.columnSpan = cell.columnSpan;
        }

        if (cell.header) {
          convertedCell.headerText = data.text;
        } else {
          convertedCell.inflectedForm = {
            id: data.inflectedFormId !== null ? String(data.inflectedFormId) : null,
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

  public static from(tableData: InflectionTableJson): InflectionTableValue {
    return new InflectionTableValue(
      convertStandardTable(tableData, cell => {
        const cellFields: Partial<CellFields<DataFields>> = {
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
            inflectedFormId: inflectedForm.id !== null ? +inflectedForm.id : null,
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
