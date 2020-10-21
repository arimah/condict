import fs from 'fs';
import path from 'path';

import {
  GraphQLSchema,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  DocumentNode,
  FragmentDefinitionNode,
  Source,
  parse,
} from 'graphql';

import formatLoc from '../../format-loc';

import {findAllGraphqlFiles} from '../../graphql';

import defineOperations from './define-operations';
import defineShared from './define-shared';
import {Globals} from './types';

const isOperationFile = (filePath: string) =>
  path.basename(filePath) === 'query.graphql';

const collectFragments = (
  fragments: Map<string, FragmentDefinitionNode>,
  document: DocumentNode
) => {
  for (const def of document.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        const prev = fragments.get(def.name.value);
        if (prev) {
          const locations = [
            prev.loc ? prev.loc.source.name : '<unknown>',
            def.loc ? def.loc.source.name : '<unknown>',
          ];
          throw new Error(
            `${formatLoc(def.loc)}: Fragment '${
              def.name.value
            }' is defined in multiple locations: ${
              locations.join(', ')
            }`
          );
        }
        fragments.set(def.name.value, def);
        break;
      }
      case 'OperationDefinition':
        throw new Error(
          `${formatLoc(
            def.loc
          )}: Operation must be inside a file named 'query.graphql'`
        );
      default:
        throw new Error(
          `${formatLoc(def.loc)}: Unexpected definition: ${def.kind}`
        );
    }
  }
};

const collectGraphqlData = (
  fragments: Map<string, FragmentDefinitionNode>,
  operationFiles: [string, DocumentNode][],
  srcDir: string
) => {
  const graphqlFiles = findAllGraphqlFiles(srcDir);

  for (const filePath of graphqlFiles) {
    const fileText = fs.readFileSync(filePath, {encoding: 'utf-8'});
    const document = parse(new Source(fileText, filePath));

    if (isOperationFile(filePath)) {
      operationFiles.push([filePath, document]);
    } else {
      collectFragments(fragments, document);
    }
  }
};

const defineClientTypes = (
  schema: GraphQLSchema,
  sharedPath: string,
  srcDir: string
): void => {
  const fragments = new Map<string, FragmentDefinitionNode>();
  const operationFiles: [string, DocumentNode][] = [];

  collectGraphqlData(fragments, operationFiles, srcDir);

  type ReferencedType =
    | GraphQLScalarType
    | GraphQLEnumType
    | GraphQLInputObjectType;
  const usedTypes = new Set<ReferencedType>();

  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();

  const globals: Globals = {
    sharedDefinitionsPath: sharedPath,
    fragments,
    schema,
    operationTypeNames: {
      query: queryType ? queryType.name : undefined,
      mutation: mutationType ? mutationType.name : undefined,
      subscription: subscriptionType ? subscriptionType.name : undefined,
    },
    useType: t => {
      usedTypes.add(t);
      return t.name;
    },
  };

  for (const [filePath, document] of operationFiles) {
    const definitions = defineOperations(globals, document, filePath);
    const outputFile = path.join(path.dirname(filePath), 'query.ts');
    fs.writeFileSync(outputFile, definitions, {encoding: 'utf-8'});
  }

  const sharedDefinitions = defineShared(schema, usedTypes);
  fs.writeFileSync(sharedPath, sharedDefinitions, {encoding: 'utf-8'});
};

export default defineClientTypes;
