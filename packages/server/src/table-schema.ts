import {schema as fullSchema} from './database';
import reindentQuery from './database/reindent-query';

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
