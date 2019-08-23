import {GraphQLList, isNonNullType} from 'graphql';

import {TypeWriter} from './types';

export const writeListType = (
  type: GraphQLList<any>,
  input: boolean,
  writeType: TypeWriter
): string => {
  let innerType = writeType(type.ofType, input);
  if (isNonNullType(type.ofType)) {
    return `${innerType}[]`;
  }
  // innerType is `T | null` or `T | undefined | null`. We need some
  // extra parentheses for precedence.
  return `(${innerType})[]`;
};
