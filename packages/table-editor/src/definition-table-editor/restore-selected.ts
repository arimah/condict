import mapSelected from '../value-helpers/map-selected';

import Value from './value';

export default (value: Value) =>
  mapSelected(value, cell =>
    !cell.header
      ? cell.set('data', cell.data.set('customForm', null))
      : cell
  );
