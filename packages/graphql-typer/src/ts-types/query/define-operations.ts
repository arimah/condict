import path from 'path';

import {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  isScalarType,
} from 'graphql';

import {CommonHeader} from '../shared';
import {TextBuilder} from '../utils';
import {isBuiltin as isBuiltinScalar} from '../builtin-scalars';

import typeOperation from './type-operation';
import {Globals, OperationParams} from './types';

const importPathTo = (fromDir: string, toFile: string): string => {
  const importPath = path
    .relative(fromDir, toFile.replace(/\.ts$/, ''))
    .replace(/\\/g, '/');
  if (path.isAbsolute(importPath)) {
    throw new Error(`Could not calculate relative path from '${fromDir}' to '${toFile}'`);
  }

  if (!importPath.startsWith('../')) {
    return `./${importPath}`;
  }
  return importPath;
};

const getOperationParams = (
  globals: Globals,
  ownFragments: ReadonlyMap<string, FragmentDefinitionNode>,
  importedTypes: Set<string>
): OperationParams => ({
  ...globals,
  ownFragments,
  useType(type) {
    const name = globals.useType(type);
    if (!isScalarType(type) || !isBuiltinScalar(type)) {
      importedTypes.add(type.name);
    }
    return name;
  },
});

const findDefinitions = (doc: DocumentNode): [
  Map<string, FragmentDefinitionNode>,
  OperationDefinitionNode[]
] => {
  const ownFragments = new Map<string, FragmentDefinitionNode>();
  const operations: OperationDefinitionNode[] = [];
  doc.definitions.forEach(d => {
    switch (d.kind) {
      case 'FragmentDefinition':
        ownFragments.set(d.name.value, d);
        break;
      case 'OperationDefinition':
        operations.push(d);
        break;
    }
  });

  return [ownFragments, operations];
};

const defineOperations = (
  globals: Globals,
  doc: DocumentNode,
  fileName: string
): string => {
  const dir = path.dirname(fileName);

  const [ownFragments, operations] = findDefinitions(doc);

  const importedTypes = new Set<string>();
  const operationParams = getOperationParams(
    globals,
    ownFragments,
    importedTypes
  );

  let hasAnonymous = false;
  const operationTypes = operations.map(op => {
    if (!op.name) {
      if (hasAnonymous) {
        throw new Error('There cannot be multiple anonymous operations in a file');
      }
      hasAnonymous = true;
    }
    return typeOperation(operationParams, op);
  });

  const result = new TextBuilder();

  result
    .appendLine(CommonHeader)
    .append('import {')
    .indented(() => {
      if (importedTypes.size > 0) {
        result.appendLine('');
        result.appendLine(
          ['Query', ...importedTypes].join(',\n')
        );
      } else {
        result.append('Query');
      }
    })
    .append('} from ')
    .append(JSON.stringify(importPathTo(dir, globals.sharedDefinitionsPath)))
    .appendLine(';\n');

  for (const op of operationTypes) {
    result
      .append(
        op.name === null
          ? 'export default '
          : `export const ${op.name} = `
      )
      .append(JSON.stringify(op.text))
      .append(' as ')
      .append(op.type)
      .appendLine(';\n');
  }

  return result.toString();
};

export default defineOperations;
