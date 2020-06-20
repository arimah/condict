import {GraphQLObjectType, GraphQLField} from 'graphql';

import getPermittedEnumValues from '../../graphql/enum-values';

import {TextBuilder, formatDescription} from '../utils';

import {TypeWriter} from './types';

const writeFieldType = (
  field: GraphQLField<any, any>,
  writeType: TypeWriter
): string => {
  const permitted = getPermittedEnumValues(field);
  if (permitted) {
    const {type, values, allowNull} = permitted;
    const formattedValues =
      values.map(v => `${type.name}.${v.name}`).join(' | ');
    return allowNull ? `${formattedValues} | null` : formattedValues;
  }
  return writeType(field.type);
};

const defineField = (
  t: TextBuilder,
  field: GraphQLField<any, any>,
  writeType: TypeWriter
) => {
  if (field.description) {
    t.appendLine(formatDescription(field.description));
  }
  t.appendLine(`${field.name}: ${writeFieldType(field, writeType)};`);
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
