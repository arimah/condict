import {Logger} from 'winston';

import Adaptor from './adaptor';
import {TableSchema, ColumnSchema, ForeignKeyRef} from './schema/types';

export interface Pool {
  getConnection(): PromiseLike<Adaptor>;
  close(): PromiseLike<void>;
}

export type FindColumn = (ref: ForeignKeyRef) => ColumnSchema;

export interface Driver {
  createPool(logger: Logger, options: any): Pool;
  generateSchema(
    schema: TableSchema[],
    findColumn: FindColumn
  ): [string, string[]][];
}
