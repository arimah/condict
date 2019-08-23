import fs from 'fs';

import {
  DocumentNode,
  GraphQLSchema,
  buildASTSchema,
  extendSchema,
  parse,
  isTypeSystemExtensionNode,
} from 'graphql';

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
  return fullSchema;
};

export default buildGraphqlSchema;
