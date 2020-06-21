import {Logger} from '../types';

import mysql from './mysql';
import sqlite from './sqlite';
import schema from './schema';
import {TableSchema, ForeignKeyRef} from './schema/types';
import {
  Driver,
  Drivers,
  DriverOptions,
  ConfigOptions,
  Pool,
  SchemaDef,
} from './types';

const drivers: Drivers = {
  mysql,
  sqlite,
};

export const createPool = <D extends keyof Drivers>(
  logger: Logger,
  options: { type: D } & DriverOptions[D]
): Pool => {
  const driver = drivers[options.type] as Driver<DriverOptions[D]>;
  return driver.createPool(logger, options);
};

export const generateSchema = <D extends keyof Drivers>(
  databaseType: D
): SchemaDef => {
  const driver = drivers[databaseType];

  const allTables = new Map(
    schema.map<[string, TableSchema]>(table => [table.name, table])
  );
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

  return driver.generateSchema(schema, findColumn);
};

export const validateOptions = (options: any): ConfigOptions => {
  if (options == null || typeof options !== 'object') {
    throw new Error('Database config must be an object.');
  }
  if (typeof options.type !== 'string') {
    throw new Error("Database config must have a 'type' property which must be a string.");
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!drivers.hasOwnProperty(options.type)) {
    throw new Error(`Unknown database type: ${options.type}`);
  }
  const type = options.type as keyof Drivers;
  const driver = drivers[type] as Driver<any>;
  return {
    type,
    ...driver.validateOptions(options),
  };
};
