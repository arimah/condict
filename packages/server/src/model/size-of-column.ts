import schema from '../database/schema';
import {isFKColumn, ColumnType} from '../database/schema/types';

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
    throw new Error(`Column not found: ${tableName}.${columnName}`);
  }
  if (isFKColumn(column)) {
    throw new Error(`Cannot get size of foreign key reference: ${tableName}.${columnName}`);
  }
  switch (column.type) {
    case ColumnType.UNSIGNED_INT:
    case ColumnType.VARCHAR:
      return column.size;
    default:
      throw new Error(
        `Cannot get size of column '${tableName}.${columnName}': the type ${column.type} has no size`
      );
  }
};

export default sizeOfColumn;
