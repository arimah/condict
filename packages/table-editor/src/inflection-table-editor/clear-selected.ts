import mapSelected from '../value-helpers/map-selected';

import Value from './value';

export default (value: Value): Value =>
  mapSelected(value, cell =>
    cell.set('data', cell.data.set('text', ''))
  );
