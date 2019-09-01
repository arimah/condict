import {
  GraphQLSchema,
  isScalarType,
  isEnumType,
  isObjectType,
  isInputObjectType,
  isUnionType,
  isInterfaceType,
} from 'graphql';

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
    .appendLine('/* eslint-disable */\n')
    .appendLine('// THIS FILE IS AUTO GENERATED.\n')
    .appendLine(`const IdKind = Symbol();\n`)
    .appendLine('// This is a hack to get TypeScript to treat different ID types as distinct.')
    .appendLine('// The actual value will be a number (hence the `number` part), but by')
    .appendLine("// pretending there's an extra property that is unique to each type, we can")
    .appendLine('// get TypeScript to reject invalid ID uses, such as attempting to assign')
    .appendLine('// a DefinitionId to a LemmaId.')
    .appendLine(
      `export type IdOf<T extends string> = number & {\n` +
      `  [IdKind]: T;\n` +
      `};\n`
    );

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
