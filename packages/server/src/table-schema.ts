import {generateSchema} from './database';
import reindentQuery from './database/reindent-query';

const getTableSchema = (tableName: string | null): string | null => {
  let schema = generateSchema();

  if (tableName !== null) {
    schema = schema.filter(([name]) => name === tableName);
  }

  if (schema.length === 0) {
    return null;
  }

  return schema
    .map(([name, statements]) =>
      [
        `-- Schema for ${name}:`,
        ...statements.map(stmt => `${reindentQuery(stmt)};`),
      ].join('\n')
    )
    .join('\n\n');
};

export default getTableSchema;
