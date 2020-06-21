import Value from '../value';
import Selection from '../value/selection';

const selectAll = <V extends Value<any>>(value: V): V => {
  const {layout} = value;
  const firstCell = layout.cellFromPosition(0, 0);
  const lastCell = layout.cellFromPosition(
    layout.rowCount - 1,
    layout.colCount - 1
  );

  return value.withSelection(new Selection(
    layout,
    lastCell.key,
    firstCell.key
  ));
};

export default selectAll;
