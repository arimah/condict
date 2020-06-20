import {GraphQLInterfaceType, GraphQLSchema} from 'graphql';

import {TextBuilder, formatDescription} from '../utils';

// In TypeScript, we know exactly what types are part of an interface, since
// there's no way to add more implementing types to an interface after the
// schema has been constructed. Basically, we can treat it like a union type.

export const defineInterfaceType = (
  result: TextBuilder,
  type: GraphQLInterfaceType,
  schema: GraphQLSchema
): void => {
  if (type.description) {
    result.appendLine(formatDescription(type.description));
  }
  result
    .append(`export type ${type.name} =`)
    .indented(() => {
      // Alternatives are always object types
      const types = schema.getPossibleTypes(type);
      for (const alternative of types) {
        result.append(`\n| ${alternative.name}`);
      }
    })
    .appendLine(';');
};
