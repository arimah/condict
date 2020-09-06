import path from 'path';

export const getGraphqlSchemaDir = (): string =>
  path.join(path.dirname(__dirname), 'graphql-schema');
