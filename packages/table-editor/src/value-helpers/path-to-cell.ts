import {LayoutCell} from '../value/types';

export type CellPath = [number, 'cells', number];

export default (layoutCell: LayoutCell): CellPath => [
  layoutCell.row,
  'cells',
  layoutCell.colIndex,
];
