const mysql = require('./mysql');
const sqlite = require('./sqlite');
const schema = require('./schema');

const adaptors = {
  mysql,
  sqlite,
};

const getAdaptor = name => {
  const adaptor = adaptors[name];
  if (!adaptor) {
    throw new Error(`Unknown database type: ${name}`);
  }
  return adaptor;
};

module.exports = {
  createPool: (logger, options) => {
    const adaptor = getAdaptor(options.type);
    return adaptor.createPool(logger, options);
  },

  generateSchema: databaseType => {
    const adaptor = getAdaptor(databaseType);

    const allTables = new Map(
      schema.map(table => [table.name, table])
    );
    const findColumn = reference => {
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

    return adaptor.generateSchema(schema, findColumn);
  },
};
