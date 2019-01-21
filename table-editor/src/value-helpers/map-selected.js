import pathToCell from './path-to-cell';

export default (value, f) => {
  const {selection, layout} = value;

  let newRows = value.rows;
  selection.selectedCells.forEach(key => {
    const layoutCell = layout.cellFromKey(key);
    newRows = newRows.updateIn(pathToCell(layoutCell), f);
  });

  return value.make(newRows, layout, selection);
};
