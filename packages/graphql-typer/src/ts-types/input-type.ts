import {
  GraphQLInputObjectType,
  GraphQLInputField,
  isNonNullType,
} from 'graphql';

import {TextBuilder, formatDescription} from './utils';
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
  t.appendLine(`${field.name}${optional ? '?' : ''}: ${writeType(field.type, true)};`);
};

export const defineInputType = (
  type: GraphQLInputObjectType,
  writeType: TypeWriter
): string => {
  const def = new TextBuilder();

  if (type.description) {
    def.appendLine(formatDescription(type.description));
  }
  def
    .appendLine(`export type ${type.name} = {`)
    .indented(() => {
      for (const field of Object.values(type.getFields())) {
        defineField(def, field, writeType);
      }
    })
    .append('};');

  return def.toString();
};
