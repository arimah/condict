import {schema as fullSchema} from './database';
import reindentQuery from './database/reindent-query';

/**
 * Gets the SQL schema statments for a specific table or all tables.
 * @param tableName The name of the table, or null to get all table schemas.
 * @return The schema for the specified table, or all tables if `tableName`
 *         is null. If an unknown table name was specified, returns null.
 */
const getTableSchema = (tableName: string | null): string | null => {
  let schema = fullSchema;

  if (tableName !== null) {
    schema = schema.filter(t => t.name === tableName);
  }

  if (schema.length === 0) {
    return null;
  }

  return schema
    .map(({name, commands}) =>
      [
        `-- Schema for ${name}:`,
        ...commands.map(cmd => `${reindentQuery(cmd)};`),
      ].join('\n')
    )
    .join('\n\n');
};

export default getTableSchema;
