import {
  GraphQLSchema,
  isScalarType,
  isEnumType,
  isObjectType,
  isInputObjectType,
  isUnionType,
  isInterfaceType,
} from 'graphql';

import {
  defineScalarType,
  isBuiltin as isBuiltinScalar,
} from './scalar-type';
import {defineEnumType} from './enum-type';
import {defineObjectType} from './object-type';
import {defineInputType} from './input-type';
import {defineUnionType} from './union-type';
import {defineInterfaceType} from './interface-type';
import {TextBuilder} from './utils';
import writeType from './write-type';

const defineTypes = (
  schema: GraphQLSchema,
  includeIntrospectionTypes: boolean
): string => {
  const def = new TextBuilder();

  // Define some basic things for IdOf.
  def
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
    // Types whose names start with '__' are used internally by GraphQL for
    // introspection queries. Exclude them unless asked for.
    if (!includeIntrospectionTypes && t.name.startsWith('__')) {
      return;
    }

    if (isScalarType(t)) {
      if (isBuiltinScalar(t)) {
        return;
      }
      def.appendLine(defineScalarType(t));
    } else if (isEnumType(t)) {
      def.appendLine(defineEnumType(t));
    } else if (isObjectType(t)) {
      def.appendLine(defineObjectType(t, writeType));
    } else if (isInputObjectType(t)) {
      def.appendLine(defineInputType(t, writeType));
    } else if (isUnionType(t)) {
      def.appendLine(defineUnionType(t));
    } else if (isInterfaceType(t)) {
      def.appendLine(defineInterfaceType(t, schema));
    }

    def.appendLine('');
  });

  return def.toString();
};

export default defineTypes;
