import {GraphQLList, GraphQLType, isNonNullType} from 'graphql';

import {TypeWriter} from './types';

export const writeListType = (
  type: GraphQLList<GraphQLType>,
  writeType: TypeWriter
): string => {
  const innerType = writeType(type.ofType);
  if (isNonNullType(type.ofType)) {
    return `${innerType}[]`;
  }
  // innerType is `T | null`. We need some extra parentheses for precedence.
  return `(${innerType})[]`;
};
