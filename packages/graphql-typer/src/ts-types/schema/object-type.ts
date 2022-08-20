import {
  GraphQLObjectType,
  GraphQLField,
  GraphQLArgument,
  isNonNullType,
} from 'graphql';

import {TextBuilder, formatDescription} from '../utils';

import {TypeWriter} from './types';

const defineArgTypes = (
  t: TextBuilder,
  args: readonly GraphQLArgument[],
  writeType: TypeWriter
) => {
  t.appendLine('{');
  t.indented(() => {
    for (const arg of args) {
      if (arg.description) {
        t.appendLine(formatDescription(arg.description));
      }
      const optional = !isNonNullType(arg.type);
      t.appendLine(
        `${arg.name}${optional ? '?' : ''}: ${writeType(arg.type)};`
      );
    }
  });
  t.append('}');
};

const defineField = (
  t: TextBuilder,
  field: GraphQLField<any, any>,
  writeType: TypeWriter
) => {
  if (field.description) {
    t.appendLine(formatDescription(field.description));
  }
  t.append(`${field.name}: `);
  if (field.args.length > 0) {
    t.append('WithArgs<');
    defineArgTypes(t, field.args, writeType);
    t.append(`, ${writeType(field.type)}>`);
  } else {
    t.append(writeType(field.type));
  }
  t.appendLine(';');
};

export const defineObjectType = (
  result: TextBuilder,
  type: GraphQLObjectType,
  writeType: TypeWriter
): void => {
  if (type.description) {
    result.appendLine(formatDescription(type.description));
  }
  result
    .appendLine(`export type ${type.name} = {`)
    .indented(() => {
      for (const field of Object.values(type.getFields())) {
        defineField(result, field, writeType);
      }
    })
    .appendLine('};');
};
