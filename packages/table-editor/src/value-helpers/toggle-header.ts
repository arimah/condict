import Value, {ValueData} from '../value';
import {Cell} from '../value/types';

import mapSelected from './map-selected';

const toggleHeader = <V extends Value<any>>(value: V): V => {
  const {selection} = value;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const focusedCell = value.getCell(selection.focusedCellKey)!;
  const header = !focusedCell.header;

  return mapSelected(
    value,
    (cell: Cell<ValueData<V>>) => cell.set('header', header)
  );
};

export default toggleHeader;
