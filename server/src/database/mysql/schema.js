const mysql = require('mysql');

const getIntType = size => {
  switch (size) {
    case 1:
    case 8: return 'tinyint(1)';
    case 16: return 'smallint(5)';
    case 32: return 'int(11)';
    case 64: return 'bigint(19)';
    default: throw new Error(`Invalid integer size: ${size}`);
  }
};

const getCollation = collation => {
  switch (collation) {
    case 'binary': return 'utf8mb4_bin';
    case 'unicode': return 'utf8mb4_unicode_ci';
    default: throw new Error(`Invalid collation: ${collation}`);
  }
};

const resolveBaseType = (column, findColumn) => {
  if (column.references) {
    const referencedColumn = findColumn(column.references);
    return resolveBaseType(referencedColumn, findColumn);
  }
  switch (column.type) {
    case 'id':
      return 'int(11) unsigned';
    case 'boolean':
      return 'tinyint(1)';
    case 'int':
      return getIntType(column.size || 32);
    case 'unsigned int':
      return getIntType(column.size || 32) + ' unsigned';
    case 'varchar':
      return `varchar(${column.size})`;
    case 'enum':
      return `enum(${column.values.map(v => mysql.escape(v)).join(',')})`
    case 'json':
      return 'json';
    default:
      throw new Error(`Invalid column type: ${column.type}`);
  }
};

const resolveColumnType = (column, findColumn) => {
  let columnType = resolveBaseType(column, findColumn);

  if (!column.allowNull) {
    columnType += ' not null';
  }
  if (column.collate) {
    columnType += ` collate ${getCollation(column.collate)}`;
  }
  if (column.default) {
    columnType += ` default ${mysql.escape(column.default)}`;
  }
  if (column.autoIncrement) {
    columnType += ' auto_increment';
  }

  return columnType;
};

const foreignKey = (ownColumn, reference) => {
  const ownName = mysql.escapeId(ownColumn.name);

  const {table, column} = reference;
  const foreignName = `${mysql.escapeId(table)}(${mysql.escapeId(column)})`;

  let definition = `foreign key (${ownName}) references ${foreignName}`;
  if (reference.onDelete) {
    definition += ` on delete ${reference.onDelete}`;
  }
  if (reference.onUpdate) {
    definition += ` on update ${reference.onUpdate}`;
  }
  return definition;
};

const columnList = columns =>
  (typeof columns === 'string' ? [columns] : columns)
    .map(c => mysql.escapeId(c))
    .join(', ');

const getIndexName = (prefix, columns) => {
  if (typeof columns === 'string') {
    columns = [columns];
  }
  return `${prefix}:${columns.join('-')}`;
};

const generateCreateTable = (table, findColumn) => {
  const foreignKeys = [];
  const columns = table.columns.map(column => {
    if (column.references) {
      foreignKeys.push(foreignKey(column, column.references));
    }

    const type = resolveColumnType(column, findColumn);
    const comment = column.comment
      ? `comment ${mysql.escape(column.comment)}`
      : '';
    return `${mysql.escapeId(column.name)} ${type} ${comment}`;
  });

  if (table.primaryKey) {
    columns.push(`primary key (${columnList(table.primaryKey)})`);
  }

  const uniqueIndexes = (table.unique || [])
    .map(columns => {
      const indexName = getIndexName('unq', columns);
      return `unique ${mysql.escapeId(indexName)} (${columnList(columns)})`;
    });
  const indexes = (table.index || [])
    .map(columns => {
      const indexName = getIndexName('idx', columns);
      return `index ${mysql.escapeId(indexName)} (${columnList(columns)})`;
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
    create table ${mysql.escapeId(table.name)} (
      ${allParts.join(',\n      ')}
    )
    engine = InnoDB
    comment = ${mysql.escape(table.comment)}
    charset = utf8mb4
    collate = utf8mb4_unicode_ci
  `;
};

module.exports = (schema, findColumn) =>
  schema.map(table =>
    [table.name, [generateCreateTable(table, findColumn)]]
  );
