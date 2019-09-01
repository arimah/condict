import {
  GraphQLSchema,
  isScalarType,
  isEnumType,
  isObjectType,
  isInputObjectType,
  isUnionType,
  isInterfaceType,
} from 'graphql';

import {CommonHeader, IdOfDefinition} from '../shared';
import {TextBuilder} from '../utils';
import {isBuiltin as isBuiltinScalar} from '../builtin-scalars';

import {defineScalarType} from './scalar-type';
import {defineEnumType} from './enum-type';
import {defineObjectType} from './object-type';
import {defineInputType} from './input-type';
import {defineUnionType} from './union-type';
import {defineInterfaceType} from './interface-type';
import writeType from './write-type';

const defineTypes = (schema: GraphQLSchema): string => {
  const result = new TextBuilder();

  // Define some basic things for IdOf.
  result
    .appendLine(CommonHeader)
    .appendLine(IdOfDefinition);

  const types =
    Object.values(schema.getTypeMap())
      .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  types.forEach(t => {
    // If the type has no AST node, it must be a built-in. Always skip those.
    if (!t.astNode) {
      return;
    }

    if (isScalarType(t)) {
      if (isBuiltinScalar(t)) {
        console.warn(`Unexpected built-in scalar type: ${t.name}`);
        return;
      }
      defineScalarType(result, t);
    } else if (isEnumType(t)) {
      defineEnumType(result, t);
    } else if (isObjectType(t)) {
      defineObjectType(result, t, writeType);
    } else if (isInputObjectType(t)) {
      defineInputType(result, t, writeType);
    } else if (isUnionType(t)) {
      defineUnionType(result, t);
    } else if (isInterfaceType(t)) {
      defineInterfaceType(result, t, schema);
    }

    result.appendLine('');
  });

  return result.toString();
};

export default defineTypes;
