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
  writeType: TypeWriter
): string => {
  if (isScalarType(type)) {
    return writeScalarType(type);
  }
  if (isListType(type)) {
    return writeListType(type, writeType);
  }
  return type.name;
};

const writeType = (type: GraphQLType): string => {
  if (isNonNullType(type)) {
    return writeNonNullType(type.ofType, writeType);
  }
  const typeText = writeNonNullType(type, writeType);
  return `${typeText} | null`;
};

export default writeType;
