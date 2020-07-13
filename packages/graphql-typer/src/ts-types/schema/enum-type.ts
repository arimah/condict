import {GraphQLEnumType, GraphQLEnumValue} from 'graphql';

import formatLoc from '../../format-loc';

import {TextBuilder, formatDescription} from '../utils';

const defineValue = (t: TextBuilder, value: GraphQLEnumValue) => {
  if (value.value !== value.name) {
    const loc = value.astNode && value.astNode.loc || undefined;
    throw new Error(
      `${formatLoc(loc)}: Non-string enum value not supported: ${value.name}`
    );
  }

  if (value.description) {
    t.appendLine(formatDescription(value.description));
  }
  t.appendLine(`${value.name} = '${value.name}',`);
};

export const defineEnumType = (
  result: TextBuilder,
  type: GraphQLEnumType
): void => {
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
