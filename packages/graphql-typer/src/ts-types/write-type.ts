import {
  GraphQLType,
  GraphQLNullableType,
  isNonNullType,
  isScalarType,
  isListType,
} from 'graphql';

import {writeScalarType} from './scalar-type';
import {writeListType} from './list-type';
import {TypeWriter} from './types';

const writeNonNullType = (
  type: GraphQLNullableType,
  input: boolean,
  writeType: TypeWriter
): string => {
  if (isScalarType(type)) {
    return writeScalarType(type, input);
  }
  if (isListType(type)) {
    return writeListType(type, input, writeType);
  }
  return type.name;
};

const writeType = (type: GraphQLType, input: boolean): string => {
  if (isNonNullType(type)) {
    return writeNonNullType(type.ofType, input, writeType);
  }
  const typeText = writeNonNullType(type, input, writeType);
  return input ? `${typeText} | undefined | null` : `${typeText} | null`;
};

export default writeType;
