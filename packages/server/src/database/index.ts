import {Logger} from 'winston';

import mysql from './mysql';
import sqlite from './sqlite';
import schema from './schema';
import {TableSchema, ForeignKeyRef} from './schema/types';
import {Driver} from './types';

interface Drivers {
  [k: string]: Driver | undefined;
}

const drivers: Drivers = {
  mysql,
  sqlite,
};

const getDriver = (name: string) => {
  const driver = drivers[name];
  if (!driver) {
    throw new Error(`Unknown database type: ${name}`);
  }
  return driver;
};

export const createPool = (logger: Logger, options: {type: string}) => {
  const driver = getDriver(options.type);
  return driver.createPool(logger, options);
};

export const generateSchema = (databaseType: string) => {
  const driver = getDriver(databaseType);

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
