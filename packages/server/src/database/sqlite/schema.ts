import {
  TableSchema,
  ColumnSchema,
  ColumnType,
  Collation,
  IndexedColumn,
  ForeignKeyRef,
  ReferenceAction,
  isFKColumn,
} from '../schema/types';

import {FindColumn} from '../types';

// The better-sqlite3 library offers no way of escaping identifiers or values
// (probably for the best, so you don't get tempted to compose queries in a
// horrible unsafe way). But here we're actually building queries from bits
// and pieces, and kinda need to be able to escape.
//
// These hand-rolled escape functions should never be used with anything that
// comes even close to being untrusted code.

const escapeId = (id: string) => `"${id}"`;

const escapeValue = (value: boolean | number | string | null) => {
  switch (typeof value) {
    case 'boolean': return value ? '1' : '0';
    case 'number': return String(value);
    case 'string':
      return `'${value.replace(/['\\]/, ch => `\\${ch}`)}'`;
    default: return null;
  }
};

const getCollation = (collation: Collation): string => {
  switch (collation) {
    case Collation.BINARY: return 'binary';
    // TODO: Make sure Unicode collation extension is loaded
    case Collation.UNICODE: return 'nocase';
  }
};

const resolveBaseType = (
  column: ColumnSchema,
  findColumn: FindColumn
): string => {
  if (isFKColumn(column)) {
    const referencedColumn = findColumn(column.references);
    return resolveBaseType(referencedColumn, findColumn);
  }
  switch (column.type) {
    case ColumnType.ID:
    case ColumnType.BOOLEAN:
    case ColumnType.UNSIGNED_INT:
      return 'integer';
    case ColumnType.VARCHAR:
    case ColumnType.JSON:
      return 'text';
    case ColumnType.ENUM: {
      if (!column.values) {
        throw new Error(`Enum column is missing values: ${column.name}`);
      }
      // We can generally rely on the app layer to perform validation of enum
      // values and not to insert anything stupid, but it also doesn't hurt
      // to have an extra check.
      const values = column.values.map(v => escapeValue(v)).join(',');
      return `text check(${escapeId(column.name)} in (${values}))`;
    }
  }
};

const resolveColumnType = (
  column: ColumnSchema,
  findColumn: FindColumn
): string => {
  let columnType = resolveBaseType(column, findColumn);

  if (!column.allowNull) {
    columnType += ' not null';
  }
  if (!isFKColumn(column)) {
    switch (column.type) {
      case ColumnType.BOOLEAN:
      case ColumnType.UNSIGNED_INT:
      case ColumnType.VARCHAR:
      case ColumnType.ENUM:
        if (column.default !== undefined) {
          columnType += ` default ${escapeValue(column.default)}`;
        }
        if (column.type === ColumnType.VARCHAR && column.collate) {
          columnType += ` collate ${getCollation(column.collate)}`;
        }
        break;
    }
  }

  return columnType;
};

const foreignKey = (
  ownColumn: ColumnSchema,
  reference: ForeignKeyRef
): string => {
  const ownName = escapeId(ownColumn.name);

  const {table, column} = reference;
  const foreignName = `${escapeId(table)}(${escapeId(column)})`;

  let definition = `foreign key (${ownName}) references ${foreignName}`;
  switch (reference.onDelete) {
    case ReferenceAction.CASCADE:
      definition += ` on delete cascade`;
      break;
    case ReferenceAction.RESTRICT:
      definition += ` on delete restrict`;
      break;
  }
  return definition;
};

const columnList = (columns: IndexedColumn) =>
  typeof columns === 'string'
    ? escapeId(columns)
    : columns.map(c => escapeId(c)).join(', ');

const getIndexName = (prefix: string, table: string, columns: IndexedColumn) => {
  if (typeof columns === 'string') {
    columns = [columns];
  }
  return `${prefix}:${table}.${columns.join('-')}`;
};

const generateCreateTable = (
  table: TableSchema,
  findColumn: FindColumn
): string[] => {
  const foreignKeys: string[] = [];
  const columns = table.columns.map(column => {
    if (isFKColumn(column)) {
      foreignKeys.push(foreignKey(column, column.references));
    }

    const type = resolveColumnType(column, findColumn);
    return `${escapeId(column.name)} ${type}`;
  });

  columns.push(`primary key (${columnList(table.primaryKey)})`);

  const uniqueIndexes = (table.unique || [])
    .map(columns => {
      const indexName = getIndexName('unq', table.name, columns);
      return `create unique index ${
          escapeId(indexName)
        } on ${escapeId(table.name)}(${
          columnList(columns)
        })`;
    });
  const indexes = (table.index || [])
    .map(columns => {
      const indexName = getIndexName('idx', table.name, columns);
      return `create index ${
          escapeId(indexName)
        } on ${escapeId(table.name)}(${
          columnList(columns)
        })`;
    });

  const allParts = [
    ...columns,
    ...foreignKeys,
  ];
  // The line breaks and indentation inside the create table statement exist
  // exclusively to aid in debugging
  const createTable = `
    create table ${escapeId(table.name)} (
      ${allParts.join(',\n      ')}
    )
  `;
  return [createTable, ...uniqueIndexes, ...indexes];
};

export default (schema: TableSchema[], findColumn: FindColumn) =>
  schema.map<[string, string[]]>(table =>
    [table.name, generateCreateTable(table, findColumn)]
  );
