import * as Immer from 'immer';

export * from './inflection-table-editor';
export * from './definition-table-editor';
export {
  default as InflectionPattern,
  Props as InflectionPatternProps,
} from './inflection-pattern';
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
export * from './theme';

// Sigh.
Immer.enableMapSet();
