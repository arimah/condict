import {Logger} from 'winston';

import Adaptor from './adaptor';
import {TableSchema, ColumnSchema, ForeignKeyRef} from './schema/types';

export type Pool = {
  getConnection(): PromiseLike<Adaptor>;
  close(): PromiseLike<void>;
};

export type FindColumn = (ref: ForeignKeyRef) => ColumnSchema;

export type Driver = {
  createPool(logger: Logger, options: any): Pool;
  generateSchema(
    schema: TableSchema[],
    findColumn: FindColumn
  ): [string, string[]][];
};
