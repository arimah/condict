import {GraphQLScalarType} from 'graphql';

import formatLoc from '../format-loc';

import {getDirective, getArgument} from './helpers';

export type MarshalType =
  | 'int'
  | 'float'
  | 'string';

const convertTypeName = (graphqlValue: string): MarshalType => {
  switch (graphqlValue) {
    case 'INT_TYPE': return 'int';
    case 'FLOAT_TYPE': return 'float';
    case 'STRING_TYPE': return 'string';
    default:
      throw new Error(`Unknown marshal type: ${graphqlValue}`);
  }
};

const getMarshalType = (type: GraphQLScalarType): MarshalType | null => {
  const marshalDirective =
    type.astNode &&
    getDirective(type.astNode, 'marshal');

  if (marshalDirective) {
    const asArgument = getArgument(marshalDirective, 'as');
    if (!asArgument) {
      throw new Error(
        `${formatLoc(
          marshalDirective.loc
        )}: @marshal directive missing 'as:' argument on scalar '${type.name}'`
      );
    }
    if (asArgument.value.kind !== 'EnumValue') {
      throw new Error(
        `${formatLoc(
          asArgument.value.loc
        )}: Expected 'as:' argument to be an enum value on scalar '${
          type.name
        }'`
      );
    }
    return convertTypeName(asArgument.value.value);
  }

  return null;
};

export default getMarshalType;
