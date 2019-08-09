import Value from '../value';
import {Cell} from '../value/types';

import pathToCell from './path-to-cell';

const mapSelected = <D, V extends Value<D>>(
  value: V,
  f: (cell: Cell<D>) => Cell<D>
) => {
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
