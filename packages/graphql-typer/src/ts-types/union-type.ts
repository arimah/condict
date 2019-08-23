import {GraphQLUnionType} from 'graphql';

import {TextBuilder, formatDescription} from './utils';

export const defineUnionType = (type: GraphQLUnionType): string => {
  const def = new TextBuilder();

  if (type.description) {
    def.appendLine(formatDescription(type.description));
  }
  def
    .append(`export type ${type.name} =`)
    .indented(() => {
      // Alternatives are always object types
      for (const alternative of type.getTypes()) {
        def.append(`\n| ${alternative.name}`);
      }
    })
    .append(';');

  return def.toString();
};
