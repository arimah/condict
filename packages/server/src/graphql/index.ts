import fs from 'fs';
import path from 'path';

import {DocumentNode, parse} from 'graphql';

import {getGraphqlSchemaDir} from '../paths';

export {getDirectives} from './directives';
export {Context, getResolvers} from './resolvers';
export {validatePageParams} from './helpers';

export * from './types';

// GraphQL schema type definitions are read from the .graphql files
// within the schema folder.
export const getTypeDefs = (): DocumentNode[] => {
  const schemaDir = getGraphqlSchemaDir();
  return fs.readdirSync(schemaDir)
    .filter(file => file.endsWith('.graphql'))
    .map(file =>
      fs.readFileSync(
        path.join(schemaDir, file),
        {encoding: 'utf-8'}
      )
    )
    .map(schema => parse(schema));
};
