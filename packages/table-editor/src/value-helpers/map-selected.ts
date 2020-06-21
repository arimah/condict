import Value, {ValueData} from '../value';
import {Cell} from '../value/types';

import pathToCell from './path-to-cell';

const mapSelected = <V extends Value<any>>(
  value: V,
  f: (cell: Cell<ValueData<V>>) => Cell<ValueData<V>>
): V => {
  const {selection, layout} = value;

  let newRows = value.rows;
  selection.selectedCells.forEach(key => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const layoutCell = layout.cellFromKey(key)!;
    newRows = newRows.updateIn(pathToCell(layoutCell), f);
  });

  return value.make(newRows, layout, selection);
};

export default mapSelected;
