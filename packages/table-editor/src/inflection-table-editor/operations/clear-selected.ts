import {Table} from '../../value';
import {mapSelected} from '../../operations';

import {InflectionTable} from '../types';

const clearSelected = (table: InflectionTable): InflectionTable =>
  Table.update(table, table => {
    mapSelected(table, (cell, data) => {
      data.text = '';
    });
  });

export default clearSelected;
