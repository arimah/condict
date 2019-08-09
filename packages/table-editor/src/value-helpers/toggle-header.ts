import Value from '../value';
import {Cell} from '../value/types';

import mapSelected from './map-selected';

export default <D, V extends Value<D>>(value: V) => {
  const {selection} = value;

  const focusedCell = value.getCell(selection.focusedCellKey) as Cell<D>;
  const header = !focusedCell.header;

  return mapSelected(value, (cell: Cell<D>) => cell.set('header', header));
};
