import {Table} from '../../value';
import {mapSelected} from '../../operations';

import {DefinitionTable} from '../types';

const deleteSelected = (table: DefinitionTable): DefinitionTable =>
  Table.update(table, table => {
    mapSelected(table, (cell, data) => {
      if (!cell.header) {
        data.customForm = '';
      }
    });
  });

export default deleteSelected;
