import {Logger} from '../types';

import Adaptor from './adaptor';
import {TableSchema, ColumnSchema, ForeignKeyRef} from './schema/types';
import {Options as MysqlOptions} from './mysql/types';
import {Options as SqliteOptions} from './sqlite/types';

export type Pool = {
  getConnection(): PromiseLike<Adaptor>;
  close(): PromiseLike<void>;
};

export type FindColumn = (ref: ForeignKeyRef) => ColumnSchema;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Driver<Opt extends object> = {
  createPool(logger: Logger, options: Opt): Pool;
  generateSchema(
    schema: TableSchema[],
    findColumn: FindColumn
  ): SchemaDef;
  validateOptions(options: { [k: string]: any }): Opt;
};

export type SchemaDef = TableDef[];

/**
 * A generated table definition. The first value is the name of the table, the
 * second an array of SQL commands that are executed to create the table.
 */
export type TableDef = [string, string[]];

export type Drivers = {
  mysql: Driver<MysqlOptions>;
  sqlite: Driver<SqliteOptions>;
};

export type DriverOptions = {
  [D in keyof Drivers]: Drivers[D] extends Driver<infer Opt> ? Opt : never;
};

type ConfigOptionsMap = {
  [D in keyof Drivers]: { type: D } & DriverOptions[D];
};

export type ConfigOptions = ConfigOptionsMap[keyof Drivers];
