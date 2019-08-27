import {GraphQLUnionType} from 'graphql';

import {TextBuilder, formatDescription} from './utils';

export const defineUnionType = (result: TextBuilder, type: GraphQLUnionType) => {
  if (type.description) {
    result.appendLine(formatDescription(type.description));
  }
  result
    .append(`export type ${type.name} =`)
    .indented(() => {
      // Alternatives are always object types
      for (const alternative of type.getTypes()) {
        result.append(`\n| ${alternative.name}`);
      }
    })
    .appendLine(';');
};
