import fs from 'fs';

import {
  DocumentNode,
  GraphQLSchema,
  buildASTSchema,
  extendSchema,
  validateSchema,
  parse,
  isTypeSystemExtensionNode,
} from 'graphql';

import formatLoc from '../format-loc';

import findAllGraphqlFiles from './find-files';

const buildGraphqlSchema = (dir: string): GraphQLSchema => {
  const files = findAllGraphqlFiles(dir);

  const combinedSource = files
    .map(file => fs.readFileSync(file, {encoding: 'utf-8'}))
    .join('\n');

  const document = parse(combinedSource);
  const definitions: DocumentNode = {
    kind: document.kind,
    loc: document.loc,
    definitions: document.definitions.filter(n =>
      !isTypeSystemExtensionNode(n)
    ),
  };
  const extensions: DocumentNode = {
    kind: document.kind,
    loc: document.loc,
    definitions: document.definitions.filter(n =>
      isTypeSystemExtensionNode(n)
    ),
  };

  const basicSchema = buildASTSchema(definitions);
  const fullSchema = extendSchema(basicSchema, extensions);
  const errors = validateSchema(fullSchema);
  if (errors.length > 0) {
    throw new Error(`The GraphQL schema is invalid:\n${errors.map(err => {
      const node = err.nodes && err.nodes[0];
      return `- ${formatLoc(node && node.loc)}: ${err.message}`;
    })}`);
  }
  return fullSchema;
};

export default buildGraphqlSchema;
