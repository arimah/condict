import {List} from 'immutable';

import {Row, LayoutCell} from './types';
import buildLayout from './build-layout';

export default class Layout {
  public readonly rowCount: number;
  public readonly colCount: number;
  public readonly grid: Readonly<LayoutCell[]>;
  public readonly cellsByKey: Map<string, LayoutCell>;

  public constructor(rows: List<Row<any>>) {
    const data = buildLayout(rows);
    this.rowCount = data.rowCount;
    this.colCount = data.colCount;
    this.grid = data.grid;
    this.cellsByKey = data.cellsByKey;
  }

  public cellFromPosition(row: number, col: number): LayoutCell {
    return this.grid[row * this.colCount + col];
  }

  public cellFromKey(key: string): LayoutCell | null {
    return this.cellsByKey.get(key) || null;
  }
}
