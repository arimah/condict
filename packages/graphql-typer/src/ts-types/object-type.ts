import {GraphQLObjectType, GraphQLField} from 'graphql';

import {TextBuilder, formatDescription} from './utils';
import {TypeWriter} from './types';

const defineField = (
  t: TextBuilder,
  field: GraphQLField<any, any, any>,
  writeType: TypeWriter
) => {
  if (field.description) {
    t.appendLine(formatDescription(field.description));
  }
  t.appendLine(`${field.name}: ${writeType(field.type, false)};`);
};

export const defineObjectType = (
  type: GraphQLObjectType,
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
