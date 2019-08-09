import Layout from './layout';
import findSelection from './find-selection';

export default class Selection {
  public readonly focusedCellKey: string;
  public readonly selectionStart: string;
  public readonly minRow: number;
  public readonly maxRow: number;
  public readonly minCol: number;
  public readonly maxCol: number;
  public readonly selectedCells: Set<string>;

  private readonly layout: Layout;

  public constructor(
    layout: Layout,
    focusedCellKey: string | null = null,
    selectionStart: string | null = null
  ) {
    this.layout = layout;
    this.focusedCellKey = focusedCellKey || layout.grid[0].key;
    this.selectionStart = selectionStart || this.focusedCellKey;

    const data = findSelection(
      this.layout,
      this.focusedCellKey,
      this.selectionStart
    );
    this.minRow = data.minRow;
    this.maxRow = data.maxRow;
    this.minCol = data.minCol;
    this.maxCol = data.maxCol;
    this.selectedCells = data.selectedCells;
  }

  public get size(): number {
    return this.selectedCells.size;
  }

  public isSelected(cellKey: string): boolean {
    return this.selectedCells.has(cellKey);
  }
}
