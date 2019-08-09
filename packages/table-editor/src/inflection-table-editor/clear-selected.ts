import mapSelected from '../value-helpers/map-selected';

import Value from './value';
import {DataFields} from './types';

export default (value: Value) =>
  mapSelected<DataFields, Value>(value, cell =>
    cell.set('data', cell.data.set('text', ''))
  );
