import {GraphQLEnumType, GraphQLEnumValue} from 'graphql';

import {TextBuilder, formatDescription} from '../utils';

const defineValue = (t: TextBuilder, value: GraphQLEnumValue) => {
  if (value.value !== value.name) {
    throw new Error(`Non-string enum value not supported: ${value.name}`);
  }

  if (value.description) {
    t.appendLine(formatDescription(value.description));
  }
  t.appendLine(`${value.name} = '${value.name}',`);
};

export const defineEnumType = (result: TextBuilder, type: GraphQLEnumType) => {
  if (type.description) {
    result.appendLine(formatDescription(type.description));
  }
  result
    .appendLine(`export const enum ${type.name} {`)
    .indented(() => {
      for (const value of type.getValues()) {
        defineValue(result, value);
      }
    })
    .appendLine('}');
};
