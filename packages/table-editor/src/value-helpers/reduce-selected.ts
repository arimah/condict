import Value from '../value';
import {Cell} from '../value/types';

const reduceSelected = <D, V extends Value<D>, R>(
  value: V,
  initialValue: R,
  f: (acc: R, cell: Cell<D>) => R
) => {
  const {selection, layout} = value;

  let result = initialValue;
  selection.selectedCells.forEach(key => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const layoutCell = layout.cellFromKey(key)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const cell = value.getCell(layoutCell.key)!;
    result = f(result, cell);
  });

  return result;
};

export default reduceSelected;
