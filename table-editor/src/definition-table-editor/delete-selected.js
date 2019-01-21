import mapSelected from '../value-helpers/map-selected';

export default value =>
  mapSelected(value, cell =>
    !cell.header
      ? cell.set('data', cell.data.set('customForm', ''))
      : cell
  );
