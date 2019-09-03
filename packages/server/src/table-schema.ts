import {generateSchema} from './database';
import {Drivers} from './database/types';
import reindentQuery from './database/reindent-query';

const getTableSchema = (
  databaseType: keyof Drivers,
  tableName: string | null
): string | null => {
  let schema = generateSchema(databaseType);

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
