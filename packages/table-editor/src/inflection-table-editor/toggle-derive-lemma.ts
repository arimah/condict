import mapSelected from '../value-helpers/map-selected';

import Value from './value';
import {DataFields} from './types';

export default (value: Value) => {
  const {selection} = value;

  // This interaction can get a bit weird when the focus is on a header cell,
  // because the derive lemma setting is not applicable (read: hidden) on
  // header cells. But if it doesn't work the way you expect, you can just
  // toggle again.
  const focusedCell = value.getCell(selection.focusedCellKey);
  if (!focusedCell) {
    return value;
  }

  const deriveLemma = !focusedCell.data.deriveLemma;
  return mapSelected<DataFields, Value>(value, cell =>
    cell.set('data', cell.data.set('deriveLemma', deriveLemma))
  );
};
