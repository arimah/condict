import {
  GraphQLInputObjectType,
  GraphQLInputField,
  isNonNullType,
} from 'graphql';

import {TextBuilder, formatDescription} from '../utils';

import {TypeWriter} from './types';

const defineField = (
  t: TextBuilder,
  field: GraphQLInputField,
  writeType: TypeWriter
) => {
  if (field.description) {
    t.appendLine(formatDescription(field.description));
  }
  // For nullable input fields, we must also mark the field as optional.
  const optional = !isNonNullType(field.type);
  t.appendLine(`${field.name}${optional ? '?' : ''}: ${writeType(field.type)};`);
};

export const defineInputType = (
  result: TextBuilder,
  type: GraphQLInputObjectType,
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
