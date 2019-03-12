import {escape, escapeId} from 'mysql';

import {
  TableSchema,
  ColumnSchema,
  ColumnType,
  Collation,
  IndexedColumn,
  ForeignKeyRef,
  isFKColumn,
} from '../schema/types';

import {FindColumn} from '../types';

const getIntType = (size: number) => {
  switch (size) {
    case 1:
    case 8: return 'tinyint(1)';
    case 16: return 'smallint(5)';
    case 32: return 'int(11)';
    case 64: return 'bigint(19)';
    default: throw new Error(`Invalid integer size: ${size}`);
  }
};

const getCollation = (collation: Collation) => {
  switch (collation) {
    case Collation.BINARY: return 'utf8mb4_bin';
    case Collation.UNICODE: return 'utf8mb4_unicode_ci';
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
      return 'int(11) unsigned';
    case ColumnType.BOOLEAN:
      return 'tinyint(1)';
    case ColumnType.UNSIGNED_INT:
      return getIntType(column.size || 32) + ' unsigned';
    case ColumnType.VARCHAR:
      return `varchar(${column.size})`;
    case ColumnType.ENUM:
      if (!column.values) {
        throw new Error(`Enum column is missing values: ${column.name}`);
      }
      return `enum(${column.values.map(v => escape(v)).join(',')})`;
    case ColumnType.JSON:
      return 'json';
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
      case ColumnType.ID:
        if (column.autoIncrement) {
          columnType += ' auto_increment';
        }
        break;
      case ColumnType.BOOLEAN:
      case ColumnType.UNSIGNED_INT:
      case ColumnType.VARCHAR:
      case ColumnType.ENUM:
        if (column.default !== undefined) {
          columnType += ` default ${escape(column.default)}`;
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
  if (reference.onDelete) {
    definition += ` on delete ${reference.onDelete}`;
  }
  return definition;
};

const columnList = (columns: IndexedColumn) =>
  typeof columns === 'string'
    ? escapeId(columns)
    : columns.map(c => escapeId(c)).join(', ');

const getIndexName = (prefix: string, columns: IndexedColumn) => {
  if (typeof columns === 'string') {
    columns = [columns];
  }
  return `${prefix}:${columns.join('-')}`;
};

const generateCreateTable = (
  table: TableSchema,
  findColumn: FindColumn
): string => {
  const foreignKeys: string[] = [];
  const columns = table.columns.map(column => {
    if (isFKColumn(column)) {
      foreignKeys.push(foreignKey(column, column.references));
    }

    const type = resolveColumnType(column, findColumn);
    const comment = `comment ${escape(column.comment)}`;
    return `${escapeId(column.name)} ${type} ${comment}`;
  });

  columns.push(`primary key (${columnList(table.primaryKey)})`);

  const uniqueIndexes = (table.unique || [])
    .map(columns => {
      const indexName = getIndexName('unq', columns);
      return `unique ${escapeId(indexName)} (${columnList(columns)})`;
    });
  const indexes = (table.index || [])
    .map(columns => {
      const indexName = getIndexName('idx', columns);
      return `index ${escapeId(indexName)} (${columnList(columns)})`;
    });

  const allParts = [
    ...columns,
    ...uniqueIndexes,
    ...indexes,
    ...foreignKeys
  ];
  // The line breaks and indentation inside the create table statement exist
  // exclusively to aid in debugging
  return `
    create table ${escapeId(table.name)} (
      ${allParts.join(',\n      ')}
    )
    engine = InnoDB
    comment = ${escape(table.comment)}
    charset = utf8mb4
    collate = utf8mb4_unicode_ci
  `;
};

export default (schema: TableSchema[], findColumn: FindColumn) =>
  schema.map<[string, string[]]>(table =>
    [table.name, [generateCreateTable(table, findColumn)]]
  );
