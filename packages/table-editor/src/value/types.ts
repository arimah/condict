import {RecordOf, List} from 'immutable';

export interface CellFields<D> {
  key: string;
  header: boolean;
  columnSpan: number;
  rowSpan: number;
  data: RecordOf<D>;
}

export type Cell<D> = RecordOf<CellFields<D>>;

export interface RowFields<D> {
  key: string;
  cells: List<Cell<D>>;
}

export type Row<D> = RecordOf<RowFields<D>>;

export interface LayoutCell {
  readonly row: number;
  readonly col: number;
  readonly colIndex: number;
  readonly rowSpan: number;
  readonly columnSpan: number;
  readonly key: string;
}
