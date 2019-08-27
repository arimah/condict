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
  t.appendLine(`${field.name}: ${writeType(field.type)};`);
};

export const defineObjectType = (
  result: TextBuilder,
  type: GraphQLObjectType,
  writeType: TypeWriter
) => {
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
