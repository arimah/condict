import {GraphQLEnumType, GraphQLEnumValue} from 'graphql';

import {TextBuilder, formatDescription} from './utils';

const defineValue = (t: TextBuilder, value: GraphQLEnumValue) => {
  if (value.value !== value.name) {
    throw new Error(`Non-string enum value not supported: ${value.name}`);
  }

  if (value.description) {
    t.appendLine(formatDescription(value.description));
  }
  t.appendLine(`${value.name} = '${value.name}',`);
};

export const defineEnumType = (type: GraphQLEnumType): string => {
  const def = new TextBuilder();

  if (type.description) {
    def.appendLine(formatDescription(type.description));
  }
  def
    .appendLine(`export const enum ${type.name} {`)
    .indented(() => {
      for (const value of type.getValues()) {
        defineValue(def, value);
      }
    })
    .append('}');

  return def.toString();
};
