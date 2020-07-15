import {ColumnSchema, ForeignKeyRef} from './schema/types';

export type FindColumn = (ref: ForeignKeyRef) => ColumnSchema;

export type SchemaDef = TableDef[];

/**
 * A generated table definition. The first value is the name of the table, the
 * second an array of SQL commands that are executed to create the table.
 */
export type TableDef = [string, string[]];
