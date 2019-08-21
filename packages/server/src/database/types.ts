import {Logger} from 'winston';

import Adaptor from './adaptor';
import {TableSchema, ColumnSchema, ForeignKeyRef} from './schema/types';
import {Options as MysqlOptions} from './mysql/types';
import {Options as SqliteOptions} from './sqlite/types';

export type Pool = {
  getConnection(): PromiseLike<Adaptor>;
  close(): PromiseLike<void>;
};

export type FindColumn = (ref: ForeignKeyRef) => ColumnSchema;

export type Driver<Opt extends object> = {
  createPool(logger: Logger, options: Opt): Pool;
  generateSchema(
    schema: TableSchema[],
    findColumn: FindColumn
  ): [string, string[]][];
  validateOptions(options: { [k: string]: any }): Opt;
};

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
