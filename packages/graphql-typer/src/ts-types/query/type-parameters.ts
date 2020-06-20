import {
  VariableDefinitionNode,
  TypeNode,
  NamedTypeNode,
  ListTypeNode,
  isScalarType,
  isEnumType,
  isInputObjectType,
} from 'graphql';

import {
  TypePosition,
  getBuiltin as getBuiltinScalar,
} from '../builtin-scalars';
import {TextBuilder} from '../utils';

import {TypeWriterParams} from './types';

// eslint-disable-next-line prefer-const
let writeVariableType: (params: TypeWriterParams, type: TypeNode) => string;

const writeListType = (
  params: TypeWriterParams,
  type: ListTypeNode
): string => {
  const innerType = writeVariableType(params, type.type);
  return (
    type.type.kind === 'NonNullType'
      ? `${innerType}[]`
      // Extra parens are needed for correct precedence in `(T | null | undefined)[]`.
      : `(${innerType})[]`
  );
};

const writeNullableType = (
  params: TypeWriterParams,
  type: NamedTypeNode | ListTypeNode
): string => {
  if (type.kind === 'ListType') {
    return writeListType(params, type);
  }

  const actualType = params.schema.getType(type.name.value);
  if (!actualType) {
    throw new Error(`Unknown type: ${type.name.value}`);
  }
  if (isScalarType(actualType)) {
    const builtin = getBuiltinScalar(actualType, TypePosition.CLIENT_INPUT);
    return builtin || params.useType(actualType);
  }
  if (isEnumType(actualType) || isInputObjectType(actualType)) {
    return params.useType(actualType);
  }
  throw new Error(`Type is not valid in input position: ${actualType.name}`);
};

writeVariableType = (params, type) => {
  switch (type.kind) {
    case 'NonNullType':
      return writeNullableType(params, type.type);
    case 'ListType':
    case 'NamedType': {
      const formattedType = writeNullableType(params, type);
      return `${formattedType} | null | undefined`;
    }
  }
};

const typeParameters = (
  params: TypeWriterParams,
  typeText: TextBuilder,
  variables?: readonly VariableDefinitionNode[]
): void => {
  if (!variables || variables.length === 0) {
    typeText.append('{} | null | undefined');
    return;
  }

  typeText
    .appendLine('{')
    .indented(() => {
      for (const def of variables) {
        typeText
          .append(def.variable.name.value)
          .append(def.type.kind === 'NonNullType' ? ': ' : '?: ')
          .append(writeVariableType(params, def.type))
          .appendLine(';');
      }
    })
    .append('}');
};

export default typeParameters;
