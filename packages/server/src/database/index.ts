import {Logger} from '../types';

import {
  Connection,
  ConnectionPool,
  Options,
  validateOptions,
  generateSchema as generateSchemaImpl,
} from './sqlite';
import schema from './schema';
import {ForeignKeyRef} from './schema/types';
import {SchemaDef} from './types';

export {default as ensureSchemaIsValid} from './validate-schema';

export {Connection, ConnectionPool, Options};

export const createPool = (
  logger: Logger,
  options: Options
): ConnectionPool => {
  return new ConnectionPool(logger, options);
};

// TODO: Rework schema generation.
export const generateSchema = (): SchemaDef => {
  const allTables = new Map(schema.map(table => [table.name, table]));

  const findColumn = (reference: ForeignKeyRef) => {
    const {table: tableName, column: columnName} = reference;
    const table = allTables.get(tableName);
    if (!table) {
      throw new Error(`Foreign key references non-existent table: ${tableName}`);
    }
    const column = table.columns.find(c => c.name === columnName);
    if (!column) {
      throw new Error(`Foreign key references non-existent column: ${columnName} in ${tableName}`);
    }
    return column;
  };

  return generateSchemaImpl(schema, findColumn);
};

export {validateOptions};
