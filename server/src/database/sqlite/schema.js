// The better-sqlite3 library offers no way of escaping identifiers or values
// (probably for the best, so you don't get tempted to compose queries in a
// horrible unsafe way). But here we're actually building queries from bits
// and pieces, and kinda need to be able to escape.
//
// These hand-rolled escape functions should never be used with anything that
// comes even close to being untrusted code.

const escapeId = id => `"${id}"`;

const escapeValue = value => {
  switch (typeof value) {
    case 'boolean': return value ? '1' : '0';
    case 'number': return String(value);
    case 'string':
      return `'${value.replace(/['\\]/, ch => `\\${ch}`)}'`;
    default: return null;
  }
};

const getCollation = collation => {
  switch (collation) {
    case 'binary': return 'binary';
    // TODO: Make sure Unicode collation extension is loaded
    case 'unicode': return 'nocase';
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
    case 'boolean':
    case 'int':
    case 'unsigned int':
      return 'integer';
    case 'varchar':
    case 'json':
      return 'text';
    case 'enum': {
      // We can generally rely on the app layer to perform validation of enum
      // values and not to insert anything stupid, but it also doesn't hurt
      // to have an extra check.
      const values = column.values.map(v => escapeValue(v)).join(',');
      return `text check(${escapeId(column.name)} in (${values}))`;
    }
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
    columnType += ` default ${escapeValue(column.default)}`;
  }

  return columnType;
};

const columnList = columns =>
  (typeof columns === 'string' ? [columns] : columns)
    .map(c => escapeId(c))
    .join(', ');

const foreignKey = (ownColumn, reference) => {
  const ownName = escapeId(ownColumn.name);

  const {table, column} = reference;
  const foreignName = `${escapeId(table)}(${escapeId(column)})`;

  let definition = `foreign key (${ownName}) references ${foreignName}`;
  if (reference.onDelete) {
    definition += ` on delete ${reference.onDelete}`;
  }
  if (reference.onUpdate) {
    definition += ` on update ${reference.onUpdate}`;
  }
  return definition;
};

const getIndexName = (prefix, table, columns) => {
  if (typeof columns === 'string') {
    columns = [columns];
  }
  return `${prefix}:${table}.${columns.join('-')}`;
};

const generateCreateTable = (table, findColumn) => {
  const foreignKeys = [];
  const columns = table.columns.map(column => {
    if (column.references) {
      foreignKeys.push(foreignKey(column, column.references));
    }

    const type = resolveColumnType(column, findColumn);
    return `${escapeId(column.name)} ${type}`;
  });

  if (table.primaryKey) {
    columns.push(`primary key (${columnList(table.primaryKey)})`);
  }

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
    ...foreignKeys
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

module.exports = (schema, findColumn) =>
  schema.map(table =>
    [table.name, generateCreateTable(table, findColumn)]
  );
