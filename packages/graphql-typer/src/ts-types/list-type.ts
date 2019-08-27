import {GraphQLList, isNonNullType} from 'graphql';

import {TypeWriter} from './types';

export const writeListType = (
  type: GraphQLList<any>,
  writeType: TypeWriter
): string => {
  let innerType = writeType(type.ofType);
  if (isNonNullType(type.ofType)) {
    return `${innerType}[]`;
  }
  // innerType is `T | null`. We need some extra parentheses for precedence.
  return `(${innerType})[]`;
};
