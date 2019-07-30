import mapSelected from '../value-helpers/map-selected';

export default value =>
  mapSelected(value, cell =>
    cell.set('data', cell.data.set('text', ''))
  );
