import mapSelected from './map-selected';

export default value => {
  const {selection} = value;

  const focusedCell = value.getCell(selection.focusedCellKey);
  const header = !focusedCell.header;

  return mapSelected(value, cell => cell.set('header', header));
};
