const schema = require('../database/schema');

// Finds the `size` of a column, for column validators that don't wish to repeat
// the column size outside the schema.
module.exports = (tableName, columnName) => {
  const table = schema.find(t => t.name === tableName);
  if (!table) {
    throw new Error(`Table not found: ${tableName}`);
  }
  const column = table.columns.find(c => c.name === columnName);
  if (!column) {
    throw new Error(`Column not found: ${columnName} in table ${tableName}`);
  }
  return column.size;
};
