import {TableSchema, NewIdMap} from '../database/schema/types';

export default (schema: TableSchema[]): NewIdMap => {
  const references: NewIdMap = {};

  for (const table of schema) {
    if (table.skipExport) {
      continue;
    }

    for (const column of table.columns) {
      if (column.references && column.references.column === 'id') {
        const {table: foreignTable} = column.references;

        if (!references[foreignTable]) {
          references[foreignTable] = new Map();
        }
      }

      if (column.contentReferences) {
        for (const ref of column.contentReferences) {
          if (ref.column !== 'id') {
            continue;
          }

          if (!references[ref.table]) {
            references[ref.table] = new Map();
          }
        }
      }
    }
  }

  return references;
};
