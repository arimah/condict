import * as Immer from 'immer';

export * from './inflection-table-editor';
export * from './definition-table-editor';
export {
  Table,
  Row,
  RowKey,
  Cell,
  CellKey,
  Selection,
  Layout,
  SelectionShape,
} from './value';

// Sigh.
Immer.enableMapSet();
