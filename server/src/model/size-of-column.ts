import schema from '../database/schema';

/**
 * Finds the size of a column, for column validators that don't wish to repeat
 * the column size outside the database schema.
 * @param tableName The name of the table.
 * @param columnName The name of the column.
 * @return The size of the column.
 */
const sizeOfColumn = (tableName: string, columnName: string): number => {
  const table = schema.find(t => t.name === tableName);
  if (!table) {
    throw new Error(`Table not found: ${tableName}`);
  }
  const column = table.columns.find(c => c.name === columnName);
  if (!column) {
    throw new Error(`Column not found: ${columnName} in table ${tableName}`);
  }
  return column.size || 0;
};

export default sizeOfColumn;
